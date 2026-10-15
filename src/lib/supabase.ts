import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string | undefined;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

if (!url || !anonKey) {
  console.warn('Supabase env vars missing — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
);

export interface Memory {
  id?: string;
  url: string;
  caption: string;
}

export interface Surprise {
  id: string | number;
  slug: string;
  creator_name: string;
  recipient_name: string;
  nickname: string | null;
  relationship: string | null;
  birthday_date: string | null;
  theme: string;
  verification_photo_url: string | null;
  letter: string | null;
  letter_photo_url: string | null;
  memories: Memory[];
  video_url: string | null;
  video_file_url: string | null;
  video_title: string | null;
  video_dedication: string | null;
  password_hash: string | null;
  balloon_recipient_name?: string | null;
  balloon_main_message?: string | null;
  balloon_personal_message?: string | null;
  balloon_closing_message?: string | null;
  balloon_emoji?: string | null;
  balloon_style?: string | null;
  created_at: string;
}

export interface Wish {
  id: string;
  surprise_id: string;
  author: string | null;
  message: string;
  created_at: string;
}

// Simple, fast, non-cryptographic hash for the optional password gate.
// Good enough to stop casual snoopers; not real security. Returns a hex string.
export async function hashPassword(pw: string): Promise<string> {
  const enc = new TextEncoder().encode(`bs::${pw}`);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  const h = await hashPassword(pw);
  return h === hash;
}

export function generateSlug(recipientName: string): string {
  const base = (recipientName || 'surprise')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'surprise';
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
