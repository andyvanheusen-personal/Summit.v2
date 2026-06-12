import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { MESSAGES, TODAY } from '../data/mockData';
import type { Message } from '../types';

interface MessagesState {
  messages: Message[];
  unreadCount: number;
  markThreadRead: (memberId: string) => void;
  sendMessage: (memberId: string, body: string) => void;
}

const MessagesContext = createContext<MessagesState>({
  messages: MESSAGES,
  unreadCount: 0,
  markThreadRead: () => {},
  sendMessage: () => {},
});

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);

  const markThreadRead = useCallback((memberId: string) => {
    setMessages((prev) =>
      prev.some((m) => m.memberId === memberId && !m.read)
        ? prev.map((m) => (m.memberId === memberId ? { ...m, read: true } : m))
        : prev,
    );
  }, []);

  const sendMessage = useCallback((memberId: string, body: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-new-${prev.length}`,
        memberId,
        from: 'coach',
        body,
        sentAt: TODAY.add(1, 'minute').toISOString(),
        read: true,
      },
    ]);
  }, []);

  const unreadCount = useMemo(
    () => messages.filter((m) => m.from === 'member' && !m.read).length,
    [messages],
  );

  return (
    <MessagesContext.Provider value={{ messages, unreadCount, markThreadRead, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMessages() {
  return useContext(MessagesContext);
}
