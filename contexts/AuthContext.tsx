import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  userProfile: any | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If we are in demo mode, ignore Firebase auth state updates (which are usually null)
      if (isDemoRef.current) {
        setLoading(false);
        return;
      }

      if (user) {
        setCurrentUser(user);
        // Fetch or create user profile
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserProfile(userSnap.data());
          } else {
            const newProfile = {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              plan: 'free',
              translationsUsed: 0,
              translationsLimit: 10,
              isContributor: false,
              pdfsUploaded: 0,
              wordsContributed: 0,
              createdAt: serverTimestamp()
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          // Fallback if Firestore fails due to permissions
          setUserProfile({
             email: user.email,
             displayName: user.displayName,
             photoURL: user.photoURL,
             plan: 'free'
          });
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in", error);
      
      // Fallback for authorized domain error (common in previews) or closed popups
      if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/operation-not-allowed') {
        isDemoRef.current = true;
        
        console.warn("Domain not authorized. Activating Demo Mode.");
        const mockUser = {
          uid: 'demo-mode-123',
          displayName: 'Usuário Demo',
          email: 'demo@nocrioulo.com',
          photoURL: '',
          emailVerified: true,
          isAnonymous: false,
        } as unknown as User;

        setCurrentUser(mockUser);
        setUserProfile({
          email: 'demo@nocrioulo.com',
          displayName: 'Usuário Demo',
          photoURL: '',
          plan: 'Demo Pro',
          translationsUsed: 5,
          translationsLimit: 100,
          isContributor: true,
          pdfsUploaded: 2,
          wordsContributed: 150,
          createdAt: new Date()
        });

        alert("⚠️ Aviso: Domínio não autorizado no Firebase.\nO app entrou em MODO DEMO para testes.");
      } else {
        alert(`Erro ao entrar: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    isDemoRef.current = false;
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore errors during sign out
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};