import { useState, useEffect, useMemo } from "react";
import { ChatStorageService, ChatSession, Message } from "../lib/ChatStorageService";
import { useAuth } from "../AuthContext";

export function useChatHistory() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load sessions
  useEffect(() => {
    if (user) {
      const unsubscribe = ChatStorageService.subscribeToSessions(user.uid, (data) => {
        setSessions(data);
      });
      return () => unsubscribe();
    } else {
      setSessions(ChatStorageService.getLocalSessions());
    }
  }, [user]);

  // Load messages when session changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    if (user) {
      ChatStorageService.getMessagesFromFirestore(user.uid, currentSessionId).then(setMessages);
    } else {
      setMessages(ChatStorageService.getLocalMessages(currentSessionId));
    }
  }, [currentSessionId, user]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(s => 
      s.title.toLowerCase().includes(query) || 
      s.lastMessage.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  const groupedSessions = useMemo(() => {
    const groups: Record<string, ChatSession[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    filteredSessions.forEach(s => {
      const date = new Date(s.updatedAt?.seconds ? s.updatedAt.seconds * 1000 : s.updatedAt);
      if (date >= today) groups.Today.push(s);
      else if (date >= yesterday) groups.Yesterday.push(s);
      else if (date >= lastWeek) groups["This Week"].push(s);
      else groups.Older.push(s);
    });

    return Object.entries(groups).filter(([_, list]) => list.length > 0);
  }, [filteredSessions]);

  const saveMessage = async (message: Message) => {
    const sessionId = currentSessionId || `session_${Math.random().toString(36).substring(2, 9)}`;
    if (!currentSessionId) setCurrentSessionId(sessionId);

    if (user) {
      await ChatStorageService.saveMessageToFirestore(user.uid, sessionId, message);
    } else {
      ChatStorageService.saveMessageLocally(sessionId, message);
      setSessions(ChatStorageService.getLocalSessions());
    }
    setMessages(prev => [...prev, message]);
  };

  const deleteSession = async (sessionId: string) => {
    if (user) {
      await ChatStorageService.clearSQLiteHistory(user.uid, sessionId);
      await ChatStorageService.deleteSessionFromFirestore(user.uid, sessionId);
    } else {
      await ChatStorageService.clearSQLiteHistory(sessionId, sessionId);
      ChatStorageService.deleteLocalSession(sessionId);
      setSessions(ChatStorageService.getLocalSessions());
    }
    if (currentSessionId === sessionId) setCurrentSessionId(null);
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    if (user) {
      await ChatStorageService.renameSessionInFirestore(user.uid, sessionId, newTitle);
    } else {
      ChatStorageService.renameLocalSession(sessionId, newTitle);
      setSessions(ChatStorageService.getLocalSessions());
    }
  };

  const clearAll = async () => {
    if (user) {
      await ChatStorageService.clearSQLiteHistory(user.uid);
      // For Firestore, we'd need a cloud function or a batch delete.
      // For now, we'll just clear local.
    } else {
      if (currentSessionId) await ChatStorageService.clearSQLiteHistory(currentSessionId);
      ChatStorageService.clearAllLocalSessions();
      setSessions([]);
    }
    setCurrentSessionId(null);
  };

  return {
    sessions: filteredSessions,
    groupedSessions,
    messages,
    currentSessionId,
    setCurrentSessionId,
    saveMessage,
    deleteSession,
    renameSession,
    clearAll,
    searchQuery,
    setSearchQuery
  };
}
