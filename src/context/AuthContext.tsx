import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { StoredUser, User } from "@/types";
import { readJSON, removeKey, writeJSON } from "@/lib/storage";

/**
 * Mock authentication for a front-end only project. Accounts live in localStorage
 * and passwords are stored as plain text, which is fine for a demo but must never
 * be done in a real app. A real version would call a backend and use httpOnly cookies.
 */

const USERS_KEY = "cc:users";
const SESSION_KEY = "cc:session";

const DEMO_ADMIN: StoredUser = {
  id: "u-admin",
  name: "Store Admin",
  email: "admin@comfortcrumb.com",
  password: "admin123",
  role: "admin",
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function loadUsers(): StoredUser[] {
  const users = readJSON<StoredUser[]>(USERS_KEY);
  if (users && users.length > 0) return users;
  writeJSON(USERS_KEY, [DEMO_ADMIN]);
  return [DEMO_ADMIN];
}

function toUser({ id, name, email, role }: StoredUser): User {
  return { id, name, email, role };
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const id = readJSON<string>(SESSION_KEY);
    if (!id) return null;
    const found = loadUsers().find((u) => u.id === id);
    return found ? toUser(found) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    await wait(400);
    const found = loadUsers().find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) throw new Error("That email and password don't match an account.");
    writeJSON(SESSION_KEY, found.id);
    const signedIn = toUser(found);
    setUser(signedIn);
    return signedIn;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await wait(400);
    const users = loadUsers();
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      throw new Error("There's already an account with that email.");
    }
    const created: StoredUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: normalized,
      password,
      role: "customer",
    };
    writeJSON(USERS_KEY, [...users, created]);
    writeJSON(SESSION_KEY, created.id);
    const signedIn = toUser(created);
    setUser(signedIn);
    return signedIn;
  }, []);

  const logout = useCallback(() => {
    removeKey(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
