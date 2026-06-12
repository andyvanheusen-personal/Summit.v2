import type { Member, TitrationStep } from '../types';

export type TitrationLadders = Record<Member['medication'], TitrationStep[]>;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function fetchMembers(): Promise<Member[]> {
  return getJson('/api/members');
}

export function fetchTitration(): Promise<TitrationLadders> {
  return getJson('/api/titration');
}
