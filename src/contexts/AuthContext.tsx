'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: 'ADMIN' | 'USER') => Promise<void>;
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
    role: 'USER'
  },
  {
    uid: 'admin-1',
    email: 'admin@teste',
    displayName: 'Admin Teste',
    role: 'ADMIN'
  },
  {
    uid: 'pietro-1',
    email: 'pietro.medeiros@webcontinental.com.br',
    displayName: 'Pietro Medeiros',
    role: 'ADMIN'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Suprimir erros de console irrelevantes durante a inicialização
  useEffect(() => {
    // Configuração silenciosa para evitar logs desnecessários
    const handleError = (event: ErrorEvent) => {
      // Suprimir erros específicos que não são relevantes
      if (
        event.filename?.includes('chrome-extension') ||
        event.message?.includes('chrome-extension') ||
        event.message?.includes('ERR_FILE_NOT_FOUND')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    return () => window.removeEventListener('error', handleError, true);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔑 Iniciando processo de login...', { email, timestamp: new Date().toISOString() });
      
      // Primeiro tentar com a API PostgreSQL
      try {
        console.log('📡 Tentando autenticação via API PostgreSQL...');
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Login bem-sucedido via API PostgreSQL:', data.user);
          setUser(data.user);
          return;
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
          console.log('⚠️ API PostgreSQL falhou:', { status: response.status, error: errorData.error });
          console.log('🔄 Tentando modo teste como fallback...');
        }
      } catch (apiError) {
        console.log('❌ Erro na conexão com API PostgreSQL:', apiError);
        console.log('🔄 Usando modo teste como fallback...');
      }

      // Fallback para modo teste
      const testUser = testUsers.find(u => u.email === email);
      
      if (testUser && (
        (email === 'teste@teste' && password === '12345') ||
        (email === 'admin@teste' && password === 'admin123') ||
        (email === 'pietro.medeiros@webcontinental.com.br' && password === 'P@ula07021995')
      )) {
        console.log('✅ Login bem-sucedido via modo teste:', testUser);
        setUser(testUser);
      } else {
        console.log('❌ Credenciais inválidas para:', email);
        throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no login';
      console.error('❌ Erro no processo de login:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: 'ADMIN' | 'USER' = 'USER') => {
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
