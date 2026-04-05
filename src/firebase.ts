import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { initializeFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, orderBy, limit, getDocFromServer, Timestamp, deleteDoc, getDocs, writeBatch, getFirestore } from "firebase/firestore";

// Import the Firebase configuration
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings and named database support
// We use initializeFirestore to set experimentalForceLongPolling which helps in some restricted network environments
let dbInstance;
try {
  const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  }, databaseId);
  console.log("Firestore initialized with database ID:", databaseId);
} catch (e) {
  console.error("Failed to initialize Firestore with settings, falling back to default initialization:", e);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handling for Firestore
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection to Firestore
async function testConnection() {
  try {
    // Attempt to get a document from the server to verify connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore: Connection established successfully.");
  } catch (error: any) {
    // If it's just a transient "unavailable" error, it might resolve itself on retry
    if (error.code === 'unavailable') {
      console.warn("Firestore: Initial connection attempt failed (unavailable). This is often transient and will retry automatically.");
    } else {
      console.error("Firestore: Connection test failed:", error.code, error.message);
    }
    
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.info("Tip: If connection issues persist, check if your network blocks WebSockets or if the Firebase project is fully provisioned.");
    }
  }
}
testConnection();

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
  getDocs,
  writeBatch
};
export type { User };
