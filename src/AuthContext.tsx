import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, User, onAuthStateChanged, signOut, signInWithPopup, googleProvider, doc, getDoc, setDoc, Timestamp, handleFirestoreError, OperationType } from "./firebase";

interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  chatCount: number;
  badge: "Bronze" | "Silver" | "Gold";
  bgColor?: string;
  frame?: string;
  isGuest?: boolean;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            // Create new profile if it doesn't exist (e.g., first time Google login)
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || "User",
              email: currentUser.email || undefined,
              photoURL: currentUser.photoURL || "😊",
              chatCount: 0,
              badge: "Bronze",
              createdAt: Timestamp.now(),
            };
            await setDoc(doc(db, "users", currentUser.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        // Check for guest in localStorage
        const guestData = localStorage.getItem("rohit_guest_profile");
        if (guestData) {
          setProfile(JSON.parse(guestData));
        } else {
          // Auto-create guest profile to bypass login page
          const guestId = "guest_" + Math.random().toString(36).substring(2, 9);
          const guestProfile: UserProfile = {
            uid: guestId,
            displayName: "Dost",
            photoURL: "👤",
            chatCount: 0,
            badge: "Bronze",
            isGuest: true,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem("rohit_guest_profile", JSON.stringify(guestProfile));
          setProfile(guestProfile);
        }
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  const loginAsGuest = async (name: string) => {
    const guestId = "guest_" + Math.random().toString(36).substring(2, 9);
    const guestProfile: UserProfile = {
      uid: guestId,
      displayName: name,
      photoURL: "👤",
      chatCount: 0,
      badge: "Bronze",
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("rohit_guest_profile", JSON.stringify(guestProfile));
    setProfile(guestProfile);
    setIsAuthReady(true);
  };

  const logout = async () => {
    if (user) {
      await signOut(auth);
    } else {
      localStorage.removeItem("rohit_guest_profile");
      setProfile(null);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updatedProfile = { ...profile, ...data };
    
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    } else {
      localStorage.setItem("rohit_guest_profile", JSON.stringify(updatedProfile));
    }
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, loginAsGuest, logout, updateProfileData, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
