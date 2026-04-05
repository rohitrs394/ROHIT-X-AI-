import { db, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, onSnapshot, deleteDoc, Timestamp, getDocs, writeBatch, handleFirestoreError, OperationType } from "../firebase";

export interface Message {
  role: "user" | "model";
  content: string;
  timestamp: any;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: any;
  createdAt: any;
}

export class ChatStorageService {
  private static LOCAL_STORAGE_KEY = "rohit_local_chats";

  // --- Firestore Operations (Logged-in Users) ---

  static async saveMessageToFirestore(uid: string, sessionId: string, message: Message, sessionTitle?: string) {
    const sessionRef = doc(db, "users", uid, "sessions", sessionId);
    const msgRef = doc(collection(db, "users", uid, "sessions", sessionId, "messages"));

    try {
      const batch = writeBatch(db);
      
      // Save message
      batch.set(msgRef, message);

      // Update session metadata
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) {
        batch.set(sessionRef, {
          id: sessionId,
          title: sessionTitle || message.content.substring(0, 30) + "...",
          lastMessage: message.content,
          updatedAt: Timestamp.now(),
          createdAt: Timestamp.now()
        });
      } else {
        batch.update(sessionRef, {
          lastMessage: message.content,
          updatedAt: Timestamp.now()
        });
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/sessions/${sessionId}`);
    }
  }

  static subscribeToSessions(uid: string, callback: (sessions: ChatSession[]) => void) {
    const q = query(collection(db, "users", uid, "sessions"), orderBy("updatedAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => doc.data() as ChatSession);
      callback(sessions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${uid}/sessions`);
    });
  }

  static async getMessagesFromFirestore(uid: string, sessionId: string): Promise<Message[]> {
    const q = query(collection(db, "users", uid, "sessions", sessionId, "messages"), orderBy("timestamp", "asc"));
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Message);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${uid}/sessions/${sessionId}/messages`);
      return [];
    }
  }

  static async deleteSessionFromFirestore(uid: string, sessionId: string) {
    try {
      await deleteDoc(doc(db, "users", uid, "sessions", sessionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}/sessions/${sessionId}`);
    }
  }

  static async renameSessionInFirestore(uid: string, sessionId: string, newTitle: string) {
    try {
      await updateDoc(doc(db, "users", uid, "sessions", sessionId), { title: newTitle });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/sessions/${sessionId}`);
    }
  }

  // --- LocalStorage Operations (Guest Users) ---

  private static getLocalData(): Record<string, { session: ChatSession; messages: Message[] }> {
    const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private static saveLocalData(data: Record<string, { session: ChatSession; messages: Message[] }>) {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  static saveMessageLocally(sessionId: string, message: Message, sessionTitle?: string) {
    const data = this.getLocalData();
    if (!data[sessionId]) {
      data[sessionId] = {
        session: {
          id: sessionId,
          title: sessionTitle || message.content.substring(0, 30) + "...",
          lastMessage: message.content,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        messages: []
      };
    }
    data[sessionId].messages.push(message);
    data[sessionId].session.lastMessage = message.content;
    data[sessionId].session.updatedAt = new Date().toISOString();
    this.saveLocalData(data);
  }

  static getLocalSessions(): ChatSession[] {
    const data = this.getLocalData();
    return Object.values(data)
      .map(d => d.session)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static getLocalMessages(sessionId: string): Message[] {
    const data = this.getLocalData();
    return data[sessionId]?.messages || [];
  }

  static deleteLocalSession(sessionId: string) {
    const data = this.getLocalData();
    delete data[sessionId];
    this.saveLocalData(data);
  }

  static renameLocalSession(sessionId: string, newTitle: string) {
    const data = this.getLocalData();
    if (data[sessionId]) {
      data[sessionId].session.title = newTitle;
      this.saveLocalData(data);
    }
  }

  static clearAllLocalSessions() {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
  }
}
