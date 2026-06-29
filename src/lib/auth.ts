import type { UserAccount, UserProfile } from "./types";
import { notifyN8n } from "./n8n";

const USERS_KEY = "jp.users";
const SESSION_KEY = "jp.session";
const PROFILE_PREFIX = "jp.profile.";

// Lightweight non-cryptographic hash for demo-only auth (no DB per Step 8).
// NOT secure. Marked as such intentionally — this is a hackathon prototype.
export function hashPassword(password: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return `h_${h.toString(16)}_${password.length}`;
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]).{8,}$/;

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  if (!emailRegex.test(email.trim())) return "Enter a valid email address";
  return null;
}

export function validatePassword(pw: string): string | null {
  if (!pw) return "Password is required";
  if (!passwordRegex.test(pw))
    return "8+ chars with uppercase, lowercase, number, and special character";
  return null;
}

export function validateName(name: string): string | null {
  if (!name) return "Name is required";
  return null;
}

function readUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(email: string, password: string, name: string): UserAccount {
  const users = readUsers();
  const e = email.trim().toLowerCase();
  if (users.find((u) => u.email === e)) {
    throw new Error("An account with this email already exists");
  }
  const user: UserAccount = {
    id: crypto.randomUUID(),
    email: e,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
    name: name,
  };
  users.push(user);
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, user.id);
  // seed empty profile
  const profile: UserProfile = {
    email: e,
    name: name,
    jobTitle: "",
    currentCompany: "",
    currentCtc: "",
    expectedCtc: "",
    seeking: "casually",
  };
  localStorage.setItem(PROFILE_PREFIX + user.id, JSON.stringify(profile));
  // Register with n8n so the workflow can email this user about new jobs.
  void notifyN8n({ event: "register", email: e, name: name });
  return user;
}

export function loginUser(email: string, password: string): UserAccount {
  const users = readUsers();
  const u = users.find((x) => x.email === email.trim().toLowerCase());
  if (!u || u.passwordHash !== hashPassword(password)) {
    throw new Error("Invalid email or password");
  }
  localStorage.setItem(SESSION_KEY, u.id);
  return u;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function currentUser(): UserAccount | null {
  const id = currentUserId();
  if (!id) return null;
  return readUsers().find((u) => u.id === id) ?? null;
}

export function getProfile(): UserProfile | null {
  const id = currentUserId();
  if (!id) return null;
  try {
    return JSON.parse(localStorage.getItem(PROFILE_PREFIX + id) ?? "null");
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  const id = currentUserId();
  if (!id) return;
  localStorage.setItem(PROFILE_PREFIX + id, JSON.stringify(profile));
}

export function deleteAccount() {
  const id = currentUserId();
  if (!id) return;
  const currUser = getProfile();
  const users = readUsers().filter((u) => u.id !== id);
  writeUsers(users);
  void notifyN8n({ event: "delete-account", email: currUser?.email, name: currUser?.name });
  localStorage.removeItem(PROFILE_PREFIX + id);
  localStorage.removeItem(SESSION_KEY);
}
