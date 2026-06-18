/**
 * localAuth.ts
 * 
 * Local credential store — acts as a fallback when the backend's serverless
 * SQLite DB is ephemeral (e.g. Vercel /tmp resets between cold starts).
 * 
 * Passwords are hashed with SHA-256 via the Web Crypto API before storage.
 * Plain-text passwords are NEVER persisted in localStorage.
 */

const STORE_KEY = 'ats_local_users';

interface LocalUser {
  email: string;
  name: string;
  passwordHash: string; // SHA-256 hex of password
  isAdmin: boolean;
}

/** SHA-256 hash of a string, returned as hex */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function loadUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(users));
}

/** Save a new user after successful registration */
export async function localSaveUser(
  email: string,
  name: string,
  password: string,
  isAdmin: boolean
): Promise<void> {
  const emailClean = email.trim().toLowerCase();
  const users = loadUsers();
  // Avoid duplicates
  const existing = users.findIndex((u) => u.email === emailClean);
  const passwordHash = await sha256(password);
  const entry: LocalUser = { email: emailClean, name, passwordHash, isAdmin };
  if (existing >= 0) {
    users[existing] = entry; // update if re-registered
  } else {
    users.push(entry);
  }
  saveUsers(users);
}

/** Verify credentials against local store. Returns user or null. */
export async function localVerifyUser(
  email: string,
  password: string
): Promise<{ name: string; email: string; isAdmin: boolean } | null> {
  const emailClean = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email === emailClean);
  if (!user) return null;
  const passwordHash = await sha256(password);
  if (passwordHash !== user.passwordHash) return null;
  return { name: user.name, email: user.email, isAdmin: user.isAdmin };
}
