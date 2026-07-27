import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "mock-session-id";
const USER_ID_COOKIE = "mock-user-id";

// In-memory user store (persists across requests in the same dev server process)
const users = new Map<
  string,
  { id: string; email: string; password: string; companyName: string }
>();

let idCounter = 1;

function generateId() {
  return `mock-user-${idCounter++}`;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function setSessionCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  userId: string
) {
  const opts = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  };
  cookieStore.set(SESSION_COOKIE, userId, opts);
  cookieStore.set(USER_ID_COOKIE, userId, opts);
}

function getActiveUserId(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): string | null {
  return cookieStore.get(USER_ID_COOKIE)?.value ?? null;
}

function findUserById(id: string) {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return null;
}

function userResponse(user: { id: string; email: string; companyName: string }) {
  return {
    id: user.id,
    email: user.email,
    user_metadata: { companyName: user.companyName },
  };
}

export async function createMockClient() {
  const cookieStore = await cookies();

  const auth = {
    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown>; emailRedirectTo?: string };
    }) {
      if (users.has(email)) {
        return {
          data: { user: null, session: null },
          error: { message: "User already registered" },
        };
      }

      const id = generateId();
      const companyName =
        (options?.data?.companyName as string) || "My Company";

      users.set(email, {
        id,
        email,
        password: hashPassword(password),
        companyName,
      });

      // Mock: skip email verification, auto-login
      setSessionCookies(cookieStore, id);

      return {
        data: {
          user: userResponse({ id, email, companyName }),
          session: { access_token: "mock-token" },
        },
        error: null,
      };
    },

    async signInWithPassword({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) {
      const user = users.get(email);
      if (!user || user.password !== hashPassword(password)) {
        return {
          data: { user: null, session: null },
          error: { message: "Invalid login credentials" },
        };
      }

      setSessionCookies(cookieStore, user.id);

      return {
        data: {
          user: userResponse(user),
          session: { access_token: "mock-token" },
        },
        error: null,
      };
    },

    async signOut() {
      cookieStore.delete(SESSION_COOKIE);
      cookieStore.delete(USER_ID_COOKIE);
      return { error: null };
    },

    async getUser() {
      const userId = getActiveUserId(cookieStore);
      if (!userId) {
        return { data: { user: null }, error: null };
      }

      const user = findUserById(userId);
      if (!user) {
        return { data: { user: null }, error: null };
      }

      return {
        data: { user: userResponse(user) },
        error: null,
      };
    },

    async exchangeCodeForSession(code: string) {
      // In mock, "code" is the user's email (used by auth callback)
      const user = users.get(code);
      if (!user) {
        // Try looking up by ID
        const byId = findUserById(code);
        if (!byId) {
          return {
            data: { user: null },
            error: { message: "Invalid or expired code" },
          };
        }
        setSessionCookies(cookieStore, byId.id);
        return {
          data: {
            user: userResponse(byId),
            session: { access_token: "mock-token" },
          },
          error: null,
        };
      }

      setSessionCookies(cookieStore, user.id);

      return {
        data: {
          user: userResponse(user),
          session: { access_token: "mock-token" },
        },
        error: null,
      };
    },

    async updateUser({
      email: newEmail,
      password: newPassword,
    }: {
      email?: string;
      password?: string;
    }) {
      const userId = getActiveUserId(cookieStore);
      if (!userId) {
        return {
          data: { user: null },
          error: { message: "Not authenticated" },
        };
      }

      const targetUser = findUserById(userId);
      if (!targetUser) {
        return {
          data: { user: null },
          error: { message: "User not found" },
        };
      }

      if (newPassword) {
        targetUser.password = hashPassword(newPassword);
      }
      if (newEmail && newEmail !== targetUser.email) {
        users.delete(targetUser.email);
        targetUser.email = newEmail;
        users.set(newEmail, targetUser);
      }

      return {
        data: { user: userResponse(targetUser) },
        error: null,
      };
    },

    async resetPasswordForEmail(
      _email: string,
      _options?: { redirectTo?: string }
    ) {
      // Mock: pretend email was sent
      return { error: null };
    },
  };

  return { auth };
}
