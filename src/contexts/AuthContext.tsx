'use client';

import React, { createContext, useContext, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: 'admin' | 'user') => Promise<void>;
  logout: () => Promise<void>;
  isTestMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Test users - sem Firebase
const testUsers: User[] = [
  {
    uid: 'test-1',
    email: 'teste@teste',
    displayName: 'Usuário Teste',
    role: 'user'
  },
  {
    uid: 'admin-1',
    email: 'admin@teste',
    displayName: 'Admin Teste',
    role: 'admin'
  },
  {
    uid: 'pietro-1',
    email: 'pietro.medeiros@webcontinental.com.br',
    displayName: 'Pietro Medeiros',
    role: 'admin'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simular login sem Firebase
      const testUser = testUsers.find(u => u.email === email);
      
      if (testUser && (
        (email === 'teste@teste' && password === '12345') ||
        (email === 'admin@teste' && password === 'admin123') ||
        (email === 'pietro.medeiros@webcontinental.com.br' && password === '123456')
      )) {
        setUser(testUser);
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: 'admin' | 'user' = 'user') => {
    setLoading(true);
    try {
      // Simular cadastro sem Firebase
      const newUser: User = {
        uid: `test-${Date.now()}`,
        email,
        displayName,
        role
      };
      
      setUser(newUser);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser: null,
    loading,
    signIn,
    signUp,
    logout,
    isTestMode: true
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
