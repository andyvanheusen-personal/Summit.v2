import type { Message } from '../types';

export async function fetchMessages(): Promise<Message[]> {
  const res = await fetch('/api/messages');
  if (!res.ok) throw new Error(`GET /api/messages → ${res.status} ${res.statusText}`);
  return res.json() as Promise<Message[]>;
}
