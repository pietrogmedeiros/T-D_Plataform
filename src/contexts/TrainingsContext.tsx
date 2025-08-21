'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Training } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface TrainingsContextType {
  trainings: Training[];
  loading: boolean;
  addTraining: (training: Omit<Training, 'id' | 'createdAt'>) => string;
  refreshTrainings: () => Promise<void>;
}

const TrainingsContext = createContext<TrainingsContextType | undefined>(undefined);

// Helper para criar timestamp mock
const createMockTimestamp = (secondsOffset: number = 0) => ({
  seconds: (Date.now() / 1000) + secondsOffset,
  nanoseconds: 0,
  toDate: () => new Date((Date.now() + secondsOffset * 1000)),
  toMillis: () => Date.now() + secondsOffset * 1000
});

// Dados mock para modo de teste
const mockTrainings: Training[] = [
  {
    id: 'mock-1',
    title: 'Introdução à Segurança do Trabalho',
    description: '<p>Este treinamento apresenta os conceitos básicos de <strong>segurança do trabalho</strong> e as principais normas regulamentadoras.</p><p>Você aprenderá sobre:</p><ul><li>EPIs obrigatórios</li><li>Procedimentos de emergência</li><li>Prevenção de acidentes</li></ul>',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    uploaderId: 'teste-admin-uid',
    createdAt: createMockTimestamp(0) as unknown as Training['createdAt']
  },
  {
    id: 'mock-2',
    title: 'Comunicação Eficaz no Ambiente Corporativo',
    description: '<p>Desenvolva suas habilidades de <strong>comunicação</strong> para se destacar no ambiente profissional.</p><h3>Módulos do curso:</h3><ol><li>Fundamentos da comunicação</li><li>Comunicação assertiva</li><li>Apresentações eficazes</li></ol>',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    uploaderId: 'teste-admin-uid',
    createdAt: createMockTimestamp(-86400) as unknown as Training['createdAt']
  },
  {
    id: 'mock-3',
    title: 'Gestão de Tempo e Produtividade',
    description: '<p>Aprenda técnicas comprovadas para <em>otimizar seu tempo</em> e aumentar sua produtividade no trabalho.</p><blockquote>A gestão eficaz do tempo é a chave para o sucesso profissional.</blockquote>',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    uploaderId: 'teste-admin-uid',
    createdAt: createMockTimestamp(-172800) as unknown as Training['createdAt']
  }
];

export function TrainingsProvider({ children }: { children: ReactNode }) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const { isTestMode } = useAuth();

  const addTraining = (trainingData: Omit<Training, 'id' | 'createdAt'>): string => {
      const newTraining: Training = {
        ...trainingData,
        id: `training-${Date.now()}`,
        createdAt: createMockTimestamp() as unknown as Training['createdAt']
      };
      
      setTrainings(prev => [newTraining, ...prev]);
      return newTraining.id;
    };  const refreshTrainings = async () => {
    setLoading(true);
    if (isTestMode) {
      setTrainings(mockTrainings);
      setLoading(false);
    } else {
      // Implementar refresh do Firebase quando necessário
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        if (isTestMode) {
          // Modo de teste - usar dados mock
          console.log('Modo de teste: carregando treinamentos mock');
          setTrainings(mockTrainings);
          setLoading(false);
          return;
        }

        if (!db) {
          // Firebase não configurado
          console.log('Firebase não configurado');
          setTrainings([]);
          setLoading(false);
          return;
        }

        // Firebase configurado - buscar dados reais
        console.log('Firebase configurado: buscando treinamentos do Firestore');
        const q = query(
          collection(db, 'trainings'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const trainingsData: Training[] = [];
        querySnapshot.forEach((doc) => {
          trainingsData.push({
            id: doc.id,
            ...doc.data()
          } as Training);
        });
        
        setTrainings(trainingsData);
      } catch (error) {
        console.error('Erro ao buscar treinamentos:', error);
        // Fallback para dados mock em caso de erro
        setTrainings(mockTrainings);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, [isTestMode]); // Dependência do modo de teste

  return (
    <TrainingsContext.Provider value={{
      trainings,
      loading,
      addTraining,
      refreshTrainings
    }}>
      {children}
    </TrainingsContext.Provider>
  );
}

export function useTrainings() {
  const context = useContext(TrainingsContext);
  if (context === undefined) {
    throw new Error('useTrainings must be used within a TrainingsProvider');
  }
  return context;
}
