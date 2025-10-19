// Authentication utilities
// Reference: firebase_barebones_javascript blueprint
import { 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export function signInWithGoogle() {
  return signInWithRedirect(auth, googleProvider);
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function handleAuthRedirect() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
  } catch (error) {
    console.error("Auth redirect error:", error);
    throw error;
  }
}
