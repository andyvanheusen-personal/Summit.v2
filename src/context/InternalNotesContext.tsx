import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CURRENT_STAFF_ID, INTERNAL_NOTES, TODAY } from '../data/mockData';
import type { InternalNote, InternalNoteCategory } from '../types';

interface NewNoteInput {
  memberId: string;
  title: string;
  body: string;
  taggedIds: string[];
  category: InternalNoteCategory;
}

interface InternalNotesState {
  notes: InternalNote[];
  taggedActiveCount: number;
  unseenIds: Set<string>;
  unseenCount: number;
  createNote: (input: NewNoteInput) => void;
  setStatus: (noteId: string, status: 'active' | 'resolved') => void;
  addReply: (noteId: string, body: string) => void;
  markSeen: (noteId: string) => void;
  markUnseen: (noteId: string) => void;
}

const InternalNotesContext = createContext<InternalNotesState>({
  notes: INTERNAL_NOTES,
  taggedActiveCount: 0,
  unseenIds: new Set(),
  unseenCount: 0,
  createNote: () => {},
  setStatus: () => {},
  addReply: () => {},
  markSeen: () => {},
  markUnseen: () => {},
});

// Notes with activity the coach hasn't viewed yet: a new tag (in-9, created
// this morning) and a new comment on a tagged note (Marcus replied on in-2).
const INITIAL_UNSEEN = ['in-2', 'in-9'];

export function InternalNotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<InternalNote[]>(INTERNAL_NOTES);
  const [unseenIds, setUnseenIds] = useState<Set<string>>(new Set(INITIAL_UNSEEN));

  const createNote = useCallback((input: NewNoteInput) => {
    setNotes((prev) => [
      {
        id: `in-new-${prev.length}`,
        authorId: CURRENT_STAFF_ID,
        status: 'active',
        createdAt: TODAY.add(2, 'minute').toISOString(),
        replies: [],
        ...input,
      },
      ...prev,
    ]);
  }, []);

  const setStatus = useCallback((noteId: string, status: 'active' | 'resolved') => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, status } : n)));
  }, []);

  const addReply = useCallback((noteId: string, body: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              replies: [
                ...n.replies,
                {
                  id: `${n.id}-r${n.replies.length + 1}-new`,
                  authorId: CURRENT_STAFF_ID,
                  body,
                  sentAt: TODAY.add(n.replies.length + 1, 'minute').toISOString(),
                },
              ],
            }
          : n,
      ),
    );
  }, []);

  const markSeen = useCallback((noteId: string) => {
    setUnseenIds((prev) => {
      if (!prev.has(noteId)) return prev;
      const next = new Set(prev);
      next.delete(noteId);
      return next;
    });
  }, []);

  const markUnseen = useCallback((noteId: string) => {
    setUnseenIds((prev) => {
      if (prev.has(noteId)) return prev;
      const next = new Set(prev);
      next.add(noteId);
      return next;
    });
  }, []);

  // The coach's action queue: active notes where they are tagged.
  const taggedActiveCount = useMemo(
    () => notes.filter((n) => n.status === 'active' && n.taggedIds.includes(CURRENT_STAFF_ID)).length,
    [notes],
  );

  // Notifications: tagged notes with activity not yet viewed — a new tag, or
  // a new comment on a note the coach is tagged in.
  const unseenCount = useMemo(
    () => notes.filter((n) => unseenIds.has(n.id) && n.taggedIds.includes(CURRENT_STAFF_ID)).length,
    [notes, unseenIds],
  );

  return (
    <InternalNotesContext.Provider
      value={{ notes, taggedActiveCount, unseenIds, unseenCount, createNote, setStatus, addReply, markSeen, markUnseen }}
    >
      {children}
    </InternalNotesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInternalNotes() {
  return useContext(InternalNotesContext);
}
