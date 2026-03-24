import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const profile: User = {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Admin User',
          photoURL: user.photoURL || undefined,
          role: 'admin',
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
          updatedAt: new Date(),
          lastLoginAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : undefined,
          isActive: true,
        };
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!currentUser) return false;
    if (roles.includes('visitor')) return true;
    return roles.includes('admin') || roles.includes('editor');
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    isAuthenticated: !!currentUser,
    userRole: currentUser ? 'admin' : 'visitor',
    login,
    loginWithGoogle,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
