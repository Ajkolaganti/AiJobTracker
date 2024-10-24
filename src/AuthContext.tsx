import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from './components/auth/firebase'
import { 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { useToast } from "../src/hooks/use-toast";

// Define the context with a default value (optional)
const AuthContext = createContext({
  user: null,
  loading: true,
  login: async (email, password) => {},
  googleSignIn: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const { toast } = useToast();

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      updateActivity();
      toast({
        title: "Success",
        description: "Logged in successfully",
        variant: "default",
      });
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in with email/password:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      updateActivity();
      console.log("Google Sign-in successful:", result.user);
      toast({
        title: "Success",
        description: "Logged in with Google",
        variant: "default",
      });
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      toast({
        title: "Success",
        description: "Logged out successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error during logout:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    googleSignIn,
    logout,
    lastActivity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}