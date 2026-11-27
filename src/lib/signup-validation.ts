// Pure helpers shared by the beta and yourcastle signup routes.
// No path aliases here so `node --test` can import this file directly.

export type SignupInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const PHONE_RE = /^[0-9+().\-\s]{7,25}$/;
const NAME_MAX = 60;
const EMAIL_MAX = 254;

/** Escapes text for Telegram HTML parse mode and HTML email bodies. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates and normalizes a signup body (trims, lowercases email).
 * Returns a user-facing error string on failure.
 */
export function parseSignup(
  body: unknown,
): { ok: true; value: SignupInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request.' };
  const b = body as Record<string, unknown>;
  const fields = ['firstName', 'lastName', 'email', 'phone'] as const;
  const out: Record<string, string> = {};

  for (const f of fields) {
    const v = b[f];
    if (typeof v !== 'string' || !v.trim()) return { ok: false, error: 'All fields are required' };
    out[f] = v.trim();
  }

  if (out.firstName.length > NAME_MAX || out.lastName.length > NAME_MAX) {
    return { ok: false, error: 'Names must be 60 characters or fewer.' };
  }
  if (out.email.length > EMAIL_MAX || !EMAIL_RE.test(out.email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!PHONE_RE.test(out.phone)) {
    return { ok: false, error: 'Please enter a valid phone number.' };
  }

  return {
    ok: true,
    value: {
      firstName: out.firstName,
      lastName: out.lastName,
      email: out.email.toLowerCase(),
      phone: out.phone,
    },
  };
}
