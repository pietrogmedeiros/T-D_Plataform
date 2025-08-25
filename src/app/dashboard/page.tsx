'use client';

import { useTrainings } from '@/contexts/TrainingsContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface UserProgress {
  id: number;
  userId: string;
  trainingId: string;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProgressStatistics {
  totalTrainings: number;
  completedTrainings: number;
  completionPercentage: number;
}

export default function DashboardPage() {
  const { trainings, loading } = useTrainings();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [statistics, setStatistics] = useState<ProgressStatistics>({
    totalTrainings: 0,
    completedTrainings: 0,
    completionPercentage: 0
  });
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        // Pegar userId do localStorage (do AuthContext)
        const userData = localStorage.getItem('user');
        if (!userData) {
          console.log('❌ Dashboard: Usuário não encontrado no localStorage');
          setProgressLoading(false);
          return;
        }
        
        const user = JSON.parse(userData);
        // Usar uid ou id, dependendo de qual existe
        const userId = user.id || user.uid;
        if (!userId) {
          console.log('❌ Dashboard: userId não encontrado');
          setProgressLoading(false);
          return;
        }
        
        console.log('📊 Dashboard: Buscando progresso para usuário:', userId);
        
        const response = await fetch(`/api/progress?userId=${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Dashboard: Dados de progresso recebidos:', data);
          setUserProgress(data.userProgress);
          
          // Usar as estatísticas da API se disponível, senão calcular com base nos treinamentos
          if (data.statistics) {
            setStatistics(data.statistics);
          } else {
            setStatistics({
              totalTrainings: trainings.length,
              completedTrainings: 0,
              completionPercentage: 0
            });
          }
        } else {
          console.log('⚠️ Dashboard: API retornou erro, usando dados padrão');
          // Se a API falhar, usar dados padrão
          setStatistics({
            totalTrainings: trainings.length,
            completedTrainings: 0,
            completionPercentage: 0
          });
        }
      } catch (error) {
        console.error('❌ Dashboard: Erro ao buscar progresso:', error);
        // Em caso de erro, usar dados padrão
        setStatistics({
          totalTrainings: trainings.length,
          completedTrainings: 0,
          completionPercentage: 0
        });
      } finally {
        setProgressLoading(false);
      }
    };

    // Aguardar os treinamentos carregarem antes de buscar progresso
    if (!loading && trainings.length >= 0) {
      fetchUserProgress();
    }
  }, [loading, trainings]);

  const formatDate = (timestamp: unknown) => {
    try {
      if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
        return (timestamp as { toDate: () => Date }).toDate().toLocaleDateString('pt-BR');
      }
      return new Date().toLocaleDateString('pt-BR');
    } catch {
      return new Date().toLocaleDateString('pt-BR');
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const getTrainingProgress = (trainingId: string) => {
    const progress = userProgress.find(p => p.trainingId === trainingId);
    return progress ? progress.progress : 0;
  };

  const isTrainingCompleted = (trainingId: string) => {
    const progress = userProgress.find(p => p.trainingId === trainingId);
    return progress ? progress.completed : false;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Bem-vindo à plataforma de treinamento e desenvolvimento</p>
          </div>

          {loading || progressLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Treinamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progressLoading ? '...' : (statistics.totalTrainings || trainings.length)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Disponíveis na plataforma
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progressLoading ? '...' : `${statistics.completionPercentage || 0}%`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Média de conclusão
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progressLoading ? '...' : (statistics.completedTrainings || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Treinamentos finalizados
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Treinamentos Disponíveis</h2>
                
                {trainings.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v11a1 1 0 102 0V6a1 1 0 10-2 0zm4 0v11a1 1 0 102 0V6a1 1 0 10-2 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treinamento disponível</h3>
                      <p className="text-gray-500 text-center max-w-md">
                        Não há treinamentos disponíveis no momento. Novos treinamentos aparecerão aqui quando forem adicionados.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainings.map((training) => (
                      <Link key={training.id} href={`/trainings/${training.id}`}>
                        <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg line-clamp-2">{training.title}</CardTitle>
                            <CardDescription className="text-sm text-gray-500">
                              Criado em {formatDate(training.createdAt)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                              {stripHtml(training.description)}
                            </p>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Progresso:</span>
                                <span className="font-medium">{getTrainingProgress(training.id)}%</span>
                              </div>
                              
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${getTrainingProgress(training.id)}%` }}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>📹 Vídeo disponível</span>
                                <span>
                                  {isTrainingCompleted(training.id) ? '✅ Concluído' : 
                                   getTrainingProgress(training.id) > 0 ? '⏱️ Em andamento' : '⏱️ Não iniciado'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
