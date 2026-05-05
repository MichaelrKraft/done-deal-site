import { createClient } from '@supabase/supabase-js';

// Placeholders allow build to succeed when env vars aren't set.
// API routes will fail at runtime if env vars are missing, but the page renders fine.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabaseAdmin = createClient(url, serviceKey);
export const supabase = createClient(url, anonKey);
