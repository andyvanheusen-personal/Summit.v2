import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchMembers, fetchTitration, type TitrationLadders } from '../api/members';
import type { Member } from '../types';

const EMPTY_TITRATION: TitrationLadders = { Wegovy: [], Zepbound: [] };

interface MembersState {
  members: Member[];
  memberById: (id: string) => Member | undefined;
  titration: TitrationLadders;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  reload: () => void;
}

const MembersContext = createContext<MembersState>({
  members: [],
  memberById: () => undefined,
  titration: EMPTY_TITRATION,
  status: 'loading',
  error: null,
  reload: () => {},
});

export function MembersProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<{ members: Member[]; titration: TitrationLadders } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMembers(), fetchTitration()])
      .then(([members, titration]) => {
        if (!cancelled) setData({ members, titration });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const byId = useMemo(() => new Map((data?.members ?? []).map((m) => [m.id, m])), [data]);
  const memberById = useCallback((id: string) => byId.get(id), [byId]);
  const reload = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return (
    <MembersContext.Provider
      value={{
        members: data?.members ?? [],
        memberById,
        titration: data?.titration ?? EMPTY_TITRATION,
        status: data ? 'ready' : error ? 'error' : 'loading',
        error,
        reload,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMembers() {
  return useContext(MembersContext);
}
