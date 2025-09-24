const TOKEN_KEY = "USER_INFO";

export function getToken(): string | null {
  const info = localStorage.getItem(TOKEN_KEY);
  if (!info) return null;
  try {
    return JSON.parse(info).token || null;
  } catch {
    return null;
  }
}

export function setToken(token: string, userInfo?: any) {
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({ token, userInfo: userInfo || {} })
  );
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
