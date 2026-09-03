export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
};

type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
};

type MeResponse = {
  success: boolean;
  user: AuthUser;
  message: string;
};

const TOKEN_KEY = "corevault_access_token";
const USER_KEY = "corevault_user";

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await fetch(
    `${process.env.BACKEND_API_URL ?? "http://localhost:4000/api"}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  const data = (await response.json()) as
    | LoginResponse
    | { success: false; message: string };

  if (!response.ok || !data.success) {
    throw new Error(data.message);
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await fetch(
    `${process.env.BACKEND_API_URL ?? "http://localhost:4000/api"}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken() ?? ""}`,
      },
    },
  );

  const data = (await response.json()) as
    | MeResponse
    | { success: false; message: string };

  if (!response.ok || !data.success) {
    logout();
    throw new Error(data.message);
  }

  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
