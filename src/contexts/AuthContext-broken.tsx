'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // Forçar modo de teste temporariamente para debug
    console.log('🔧 Modo de teste ativado temporariamente');
    setIsTestMode(true);
    setLoading(false);
    return;
    
    if (!auth || !db) {
      // Firebase não está configurado - modo de teste
      console.log('Firebase não configurado - ativando modo de teste');
      setIsTestMode(true);
      setLoading(false);
      return;
    }

    setIsTestMode(false);
    console.log('🔥 Firebase configurado - iniciando listener de autenticação');
    
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      console.log('👤 Estado de autenticação mudou:', firebaseUser ? firebaseUser.email : 'Deslogado');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Verificar se é o email do admin principal
        const isMainAdmin = firebaseUser.email === 'pietro.medeiros@webcontinental.com.br';
        
        // Se é admin principal, criar usuario imediatamente como fallback
        if (isMainAdmin) {
          const adminUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Pietro Medeiros',
            role: 'admin'
          };
          console.log('👑 Admin principal detectado - definindo como admin');
          setUser(adminUser);
        }
        
        // Aguardar um pouco antes de tentar acessar o Firestore
        setTimeout(async () => {
          try {
            console.log('📋 Buscando dados do usuário no Firestore...');
            // Buscar dados do usuário no Firestore
            const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            console.log('✅ Usuário encontrado no Firestore');
            const userData = userDoc.data() as User;
            
            // Se é o admin principal, garantir que o role seja 'admin'
            if (isMainAdmin && userData.role !== 'admin') {
              console.log('👑 Atualizando usuário principal para admin');
              const updatedUser = { ...userData, role: 'admin' as const };
              await setDoc(doc(db!, 'users', firebaseUser.uid), updatedUser);
              setUser(updatedUser);
            } else {
              setUser(userData);
            }
          } else {
            console.log('⚠️ Usuário não encontrado no Firestore, criando...');
            // Se o usuário não existe no Firestore, criar um usuário
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              role: isMainAdmin ? 'admin' : 'user' // Admin principal sempre é admin
            };
            
            console.log('💾 Salvando novo usuário no Firestore:', newUser);
            if (isMainAdmin) {
              console.log('👑 Criando usuário como administrador principal');
            }
            
            // Salvar o usuário no Firestore
            await setDoc(doc(db!, 'users', firebaseUser.uid), newUser);
            console.log('✅ Usuário criado com sucesso');
            setUser(newUser);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar/criar dados do usuário:', error);
          // Em caso de erro, criar um usuário temporário
          const isMainAdmin = firebaseUser.email === 'pietro.medeiros@webcontinental.com.br';
          const tempUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            role: isMainAdmin ? 'admin' : 'user' // Admin principal sempre é admin, mesmo em caso de erro
          };
          console.log('🔄 Usando dados temporários:', tempUser);
          if (isMainAdmin) {
            console.log('👑 Usuário principal detectado - aplicando role de admin');
          }
          setUser(tempUser);
        }
        }, 1000); // Aguardar 1 segundo antes de acessar Firestore
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
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
