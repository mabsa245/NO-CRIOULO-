import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6L1AmZc8xYv-Gad9UfcUX_0y-udxOqwY",
  authDomain: "no-crioulo.firebaseapp.com",
  projectId: "no-crioulo",
  storageBucket: "no-crioulo.firebasestorage.app",
  messagingSenderId: "989353001244",
  appId: "1:989353001244:web:512ccd75febc73fd98fad9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Helper types
export interface UserStats {
  translationsUsed: number;
  translationsLimit: number;
  isContributor: boolean;
  pdfsUploaded: number;
  wordsContributed: number;
}

export interface VocabularyEntry {
  word: string;
  translation: string;
  targetLang: string;
  source: 'pdf' | 'user' | 'ai';
  uploadedBy?: string;
  frequency: number;
}

// Database Helpers
export const addVocabulary = async (entry: VocabularyEntry) => {
  try {
    await addDoc(collection(db, 'vocabulary'), {
      ...entry,
      createdAt: serverTimestamp(),
      variations: [entry.word], // Initial variation is just the word itself
      lastUsed: serverTimestamp()
    });
  } catch (e) {
    console.error("Error adding vocabulary: ", e);
  }
};

export const updateUserStats = async (userId: string, field: keyof UserStats, value: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    [field]: increment(value)
  });
};

export const saveTranslationHistory = async (data: any) => {
  await addDoc(collection(db, 'translations_history'), {
    ...data,
    timestamp: serverTimestamp()
  });
};