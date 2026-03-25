/**
 * Fuzzy address matching for inbound emails.
 * Compares a property address from an incoming email/PDF against
 * existing transaction addresses to find likely matches.
 */

export interface AddressMatchResult {
  match: string | null
  confidence: number
}

/**
 * Normalize a property address for comparison:
 * - lowercase
 * - strip unit/apt/suite numbers
 * - remove punctuation and extra whitespace
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/\b(unit|apt|suite|ste|#)\s*\S+/gi, '')
    .replace(/[.,#\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Compute similarity between two strings using a character-level
 * Levenshtein distance, normalized to 0..1 (1 = identical).
 */
function similarity(a: string, b: string): number {
  if (a === b) return 1
  const lenA = a.length
  const lenB = b.length
  if (lenA === 0 || lenB === 0) return 0

  // Levenshtein distance via two-row DP
  let prev = Array.from({ length: lenB + 1 }, (_, i) => i)
  let curr = new Array<number>(lenB + 1)

  for (let i = 1; i <= lenA; i++) {
    curr[0] = i
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1,     // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }

  const distance = prev[lenB]
  return 1 - distance / Math.max(lenA, lenB)
}

/**
 * Find the best matching address from a list of existing addresses.
 * Returns the match with highest confidence if above 0.8 threshold, else null.
 */
export function fuzzyMatchAddress(
  incoming: string,
  existingAddresses: string[]
): AddressMatchResult {
  if (!incoming || existingAddresses.length === 0) {
    return { match: null, confidence: 0 }
  }

  const normalizedIncoming = normalizeAddress(incoming)
  let bestMatch: string | null = null
  let bestConfidence = 0

  for (const existing of existingAddresses) {
    const normalizedExisting = normalizeAddress(existing)
    const score = similarity(normalizedIncoming, normalizedExisting)
    if (score > bestConfidence) {
      bestConfidence = score
      bestMatch = existing
    }
  }

  if (bestConfidence >= 0.8) {
    return { match: bestMatch, confidence: bestConfidence }
  }

  return { match: null, confidence: bestConfidence }
}
