/**
 * uuid.js — Minimal UUID v4 generator.
 *
 * Uses the Web Crypto API (crypto.randomUUID) available in all modern
 * browsers. This avoids adding the `uuid` npm package for a single use case.
 *
 * Falls back to a Math.random()-based approach only in non-browser environments
 * (e.g., if this code is ever unit-tested in Node < 19).
 *
 * @returns {string} A RFC4122 version-4 UUID string.
 */
export function v4() {
  // Prefer the native crypto API — cryptographically secure and built-in.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback: Math.random-based UUID (non-cryptographic, only for old envs)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
