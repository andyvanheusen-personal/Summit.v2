import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchMessages } from '../api/messages';
import { TODAY } from '../data/mockData';
import type { Message } from '../types';

interface MessagesState {
  messages: Message[];
  unreadCount: number;
  markThreadRead: (memberId: string) => void;
  sendMessage: (memberId: string, body: string) => void;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  reload: () => void;
}

const MessagesContext = createContext<MessagesState>({
  messages: [],
  unreadCount: 0,
  markThreadRead: () => {},
  sendMessage: () => {},
  status: 'loading',
  error: null,
  reload: () => {},
});

export function MessagesProvider({ children }: { children: ReactNode }) {
  // null until the seed data arrives from Strata; mutations stay client-side.
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchMessages()
      .then((msgs) => {
        if (!cancelled) setMessages(msgs);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const markThreadRead = useCallback((memberId: string) => {
    setMessages((prev) =>
      prev?.some((m) => m.memberId === memberId && !m.read)
        ? prev.map((m) => (m.memberId === memberId ? { ...m, read: true } : m))
        : prev,
    );
  }, []);

  const sendMessage = useCallback((memberId: string, body: string) => {
    setMessages((prev) => [
      ...(prev ?? []),
      {
        id: `msg-new-${prev?.length ?? 0}`,
        memberId,
        from: 'coach',
        body,
        sentAt: TODAY.add(1, 'minute').toISOString(),
        read: true,
      },
    ]);
  }, []);

  const unreadCount = useMemo(
    () => (messages ?? []).filter((m) => m.from === 'member' && !m.read).length,
    [messages],
  );

  const reload = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return (
    <MessagesContext.Provider
      value={{
        messages: messages ?? [],
        unreadCount,
        markThreadRead,
        sendMessage,
        status: messages ? 'ready' : error ? 'error' : 'loading',
        error,
        reload,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMessages() {
  return useContext(MessagesContext);
}
