'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Training } from '@/types';

interface TrainingsContextType {
  trainings: Training[];
  loading: boolean;
  addTraining: (training: Omit<Training, 'id' | 'createdAt'>) => string;
  refreshTrainings: () => Promise<void>;
}

const TrainingsContext = createContext<TrainingsContextType | undefined>(undefined);

// Função para buscar treinamentos da API PostgreSQL
async function fetchTrainingsFromAPI(): Promise<Training[]> {
  try {
    console.log('📡 Buscando treinamentos da API PostgreSQL...');
    // Adicionar timestamp para evitar cache
    const timestamp = Date.now();
    const response = await fetch(`/api/trainings?_t=${timestamp}`, {
      cache: 'no-store', // Forçar não usar cache
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar treinamentos');
    }
    const data = await response.json();
    
    console.log('✅ Dados recebidos da API:', data.length, 'treinamentos');
    
    return data.map((training: {
      id: string;
      title: string;
      description: string;
      videoUrl?: string;
      videoPath?: string;
      uploaderId: string;
      createdAt: string;
    }) => ({
      id: training.id,
      title: training.title,
      description: training.description,
      videoUrl: training.videoUrl,
      videoPath: training.videoPath,
      uploaderId: training.uploaderId,
      createdAt: {
        seconds: Math.floor(new Date(training.createdAt).getTime() / 1000),
        nanoseconds: 0,
        toDate: () => new Date(training.createdAt),
        toMillis: () => new Date(training.createdAt).getTime(),
        isEqual: () => false,
        toJSON: () => ({ 
          seconds: Math.floor(new Date(training.createdAt).getTime() / 1000),
          nanoseconds: 0,
          type: 'timestamp'
        })
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar treinamentos da API:', error);
    return [];
  }
}

export function TrainingsProvider({ children }: { children: ReactNode }) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  const addTraining = (trainingData: Omit<Training, 'id' | 'createdAt'>): string => {
    console.log('📝 Adicionando novo treinamento:', trainingData.title);
    
    // Simular criação (a função real de upload já chama a API)
    const id = `training-${Date.now()}`;
    
    // Atualizar lista após um tempo
    setTimeout(() => {
      refreshTrainings();
    }, 1000);
    
    return id;
  };

  const refreshTrainings = async () => {
    setLoading(true);
    console.log('🔄 Atualizando lista de treinamentos...');
    
    try {
      const apiTrainings = await fetchTrainingsFromAPI();
      console.log('✅ Treinamentos atualizados:', apiTrainings.length);
      setTrainings(apiTrainings);
    } catch (error) {
      console.error('❌ Erro ao atualizar treinamentos:', error);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        console.log('🔄 Carregando treinamentos...');

        // Timeout de 5 segundos
        const timeoutId = setTimeout(() => {
          console.log('⏰ Timeout - Finalizando loading');
          setLoading(false);
        }, 5000);

        const apiTrainings = await fetchTrainingsFromAPI();
        
        clearTimeout(timeoutId);
        
        if (apiTrainings.length > 0) {
          console.log('✅ Treinamentos carregados:', apiTrainings.length);
          setTrainings(apiTrainings);
        } else {
          console.log('ℹ️ Nenhum treinamento encontrado');
          setTrainings([]);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar treinamentos:', error);
        setTrainings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

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
