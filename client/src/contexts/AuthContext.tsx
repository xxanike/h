import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User as FirebaseUser } from "firebase/auth";
import { onAuthChange, signInWithGoogle, signOut } from "@/lib/auth";
import type { User } from "@shared/schema";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signIn: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from backend
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${await firebaseUser.getIdToken()}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = () => {
    signInWithGoogle();
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, signIn: handleSignIn, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
