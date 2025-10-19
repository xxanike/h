export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
}

export function signInWithGoogle() {
  window.location.href = "/api/auth/google";
}

export async function signOut() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "/login";
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}
