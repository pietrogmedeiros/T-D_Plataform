'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: 'admin' | 'user') => Promise<void>;
  logout: () => Promise<void>;
  isTestMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true); // Forçar modo de teste

  useEffect(() => {
    // Modo de teste ativo - não usar Firebase por enquanto
    console.log('🔧 Modo de teste ativo');
    setIsTestMode(true);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isTestMode || !auth) {
      // Modo de teste - validar credenciais mock
      if (email === 'teste@teste' && password === '12345') {
        const testUser: User = {
          uid: 'teste-user-uid',
          email: 'teste@teste',
          displayName: 'Usuário Teste',
          role: 'user'
        };
        setUser(testUser);
        return;
      }
      
      if (email === 'admin@teste' && password === 'admin123') {
        const testAdmin: User = {
          uid: 'teste-admin-uid',
          email: 'admin@teste',
          displayName: 'Admin Teste',
          role: 'admin'
        };
        setUser(testAdmin);
        return;
      }

      if (email === 'pietro.medeiros@webcontinental.com.br' && password === '123456') {
        const pietroAdmin: User = {
          uid: 'pietro-admin-uid',
          email: 'pietro.medeiros@webcontinental.com.br',
          displayName: 'Pietro Medeiros',
          role: 'admin'
        };
        setUser(pietroAdmin);
        return;
      }
      
      throw new Error('Credenciais inválidas');
    }

    try {
      await signInWithEmailAndPassword(auth!, email, password);
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      throw new Error('Credenciais inválidas');
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: 'admin' | 'user' = 'user') => {
    if (isTestMode || !auth || !db) {
      throw new Error('Modo de teste - cadastro não disponível');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        displayName,
        role
      };
      
      // Salvar dados do usuário no Firestore
      await setDoc(doc(db!, 'users', firebaseUser.uid), newUser);
      
    } catch (error: unknown) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    if (isTestMode || !auth) {
      setUser(null);
      setFirebaseUser(null);
      return;
    }
    
    try {
      await signOut(auth!);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    logout,
    isTestMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
