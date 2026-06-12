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
  createNote: (input: NewNoteInput) => void;
  setStatus: (noteId: string, status: 'active' | 'resolved') => void;
}

const InternalNotesContext = createContext<InternalNotesState>({
  notes: INTERNAL_NOTES,
  taggedActiveCount: 0,
  createNote: () => {},
  setStatus: () => {},
});

export function InternalNotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<InternalNote[]>(INTERNAL_NOTES);

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

  // "Notifications": active notes where the signed-in staff member is tagged.
  const taggedActiveCount = useMemo(
    () => notes.filter((n) => n.status === 'active' && n.taggedIds.includes(CURRENT_STAFF_ID)).length,
    [notes],
  );

  return (
    <InternalNotesContext.Provider value={{ notes, taggedActiveCount, createNote, setStatus }}>
      {children}
    </InternalNotesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInternalNotes() {
  return useContext(InternalNotesContext);
}
