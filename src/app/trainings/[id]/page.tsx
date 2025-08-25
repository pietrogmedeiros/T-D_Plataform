'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Clock, User, CheckCircle } from 'lucide-react';
import { useTrainings } from '@/contexts/TrainingsContext';
import { Training } from '@/types';

export default function TrainingPage() {
  const params = useParams();
  const router = useRouter();
  const { trainings } = useTrainings();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [hasReached50, setHasReached50] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [updatingRating, setUpdatingRating] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const [watchedTime, setWatchedTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const id = params.id as string;

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        // Primeiro tentar encontrar nos treinamentos do contexto
        const localTraining = trainings.find(t => t.id === id);
        if (localTraining) {
          setTraining(localTraining);
          setLoading(false);
          return;
        }

        // Se não encontrar, tentar buscar na API
        try {
          const response = await fetch(`/api/trainings/${id}`);
          if (response.ok) {
            const apiTraining = await response.json();
            // Transformar dados da API para o formato Training
            const formattedTraining = {
              ...apiTraining,
              createdAt: {
                seconds: Math.floor(new Date(apiTraining.createdAt).getTime() / 1000),
                nanoseconds: 0,
                toDate: () => new Date(apiTraining.createdAt),
                toMillis: () => new Date(apiTraining.createdAt).getTime(),
                isEqual: () => false,
                toJSON: () => ({ 
                  seconds: Math.floor(new Date(apiTraining.createdAt).getTime() / 1000),
                  nanoseconds: 0,
                  type: 'timestamp'
                })
              }
            } as Training;
            setTraining(formattedTraining);
          } else {
            console.log('Treinamento não encontrado na API');
          }
        } catch (apiError) {
          console.log('Erro ao buscar na API:', apiError);
        }
      } catch (error) {
        console.error('Erro ao buscar treinamento:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProgress = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        
        const user = JSON.parse(userData);
        // Usar uid ou id, dependendo de qual existe
        const userId = user.id || user.uid;
        if (!userId) return;
        
        // Buscar progresso
        const progressResponse = await fetch(`/api/progress?userId=${userId}`);
        if (progressResponse.ok) {
          const data = await progressResponse.json();
          const trainingProgress = data.userProgress.find((p: { trainingId: string }) => p.trainingId === id);
          if (trainingProgress) {
            setProgress(trainingProgress.progress);
            setIsCompleted(trainingProgress.completed);
            
            // Atualizar flags baseado no progresso salvo
            if (trainingProgress.progress >= 50) {
              setHasReached50(true);
            }
            if (trainingProgress.completed) {
              setHasCompleted(true);
            }
          }
        }

        // Buscar avaliação salva
        const ratingResponse = await fetch(`/api/ratings?userId=${userId}&trainingId=${id}`);
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          if (ratingData.rating) {
            setRating(ratingData.rating.rating);
          }
        }
        
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchTraining();
    fetchUserProgress();
  }, [id, trainings]);

  const updateProgress = useCallback(async (newProgress: number, completed = false) => {
    setUpdatingProgress(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      // Usar uid ou id, dependendo de qual existe
      const userId = user.id || user.uid;
      if (!userId) return;
      
      console.log('📊 Atualizando progresso:', { userId, trainingId: id, progress: newProgress, completed });
      
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          trainingId: id,
          progress: newProgress,
          completed
        }),
      });

      if (response.ok) {
        setProgress(newProgress);
        setIsCompleted(completed);
        console.log('✅ Progresso atualizado com sucesso');
      } else {
        console.error('❌ Erro ao atualizar progresso');
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    } finally {
      setUpdatingProgress(false);
    }
  }, [id]);

  // Função para salvar progresso automaticamente (debounced)
  useEffect(() => {
    let progressTimeout: NodeJS.Timeout;
    
    // Salvar progresso automaticamente a cada 10% ou quando completar marcos importantes
    if (videoProgress > lastSavedProgress && videoProgress % 10 === 0) {
      progressTimeout = setTimeout(() => {
        if (videoProgress > progress) {
          updateProgress(videoProgress);
          setLastSavedProgress(videoProgress);
        }
      }, 2000); // Debounce de 2 segundos
    }
    
    return () => {
      if (progressTimeout) {
        clearTimeout(progressTimeout);
      }
    };
  }, [videoProgress, lastSavedProgress, progress, updateProgress]);

  // Função para lidar com o carregamento do vídeo
  const handleVideoLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    setVideoDuration(video.duration);
    setVideoElement(video);
    
    // Se há progresso salvo, posicionar o vídeo no local correto
    if (progress > 0 && progress < 100) {
      const savedTime = (progress / 100) * video.duration;
      video.currentTime = savedTime;
      setWatchedTime(savedTime);
    }
  };

  // Função para lidar com o progresso do vídeo (atualizada)
  const handleVideoTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    if (duration > 0) {
      const progressPercent = Math.round((currentTime / duration) * 100);
      setVideoProgress(progressPercent);
      setWatchedTime(currentTime);
      
      // Marcar 50% quando vídeo passar da metade
      if (progressPercent >= 50 && !hasReached50 && progress < 50) {
        console.log('🏁 Marcando 50% como concluído');
        setHasReached50(true);
        updateProgress(50);
        setLastSavedProgress(50);
      }
      
      // Marcar como concluído quando chegar a 99% ou mais
      if (progressPercent >= 99 && !hasCompleted && !isCompleted) {
        console.log('🎉 Marcando treinamento como concluído automaticamente');
        setHasCompleted(true);
        updateProgress(100, true);
        setLastSavedProgress(100);
      }
    }
  };

  // Função para quando o vídeo terminar
  const handleVideoEnded = () => {
    console.log('🎬 Vídeo terminou - marcando como concluído');
    setVideoProgress(100);
    if (!hasCompleted && !isCompleted) {
      setHasCompleted(true);
      updateProgress(100, true);
      setLastSavedProgress(100);
    }
  };

  // Função para pular para uma posição específica do vídeo
  const handleSeekToProgress = (targetProgress: number) => {
    if (videoElement && videoDuration > 0) {
      const targetTime = (targetProgress / 100) * videoDuration;
      videoElement.currentTime = targetTime;
      setWatchedTime(targetTime);
    }
  };

  // Função para lidar com avaliação por estrelas
  const handleStarClick = async (starRating: number) => {
    setUpdatingRating(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('❌ Usuário não encontrado no localStorage');
        return;
      }
      
      const user = JSON.parse(userData);
      const userId = user.id || user.uid;
      if (!userId) {
        console.error('❌ UserId não encontrado');
        return;
      }
      
      console.log('📤 Enviando avaliação:', { userId, trainingId: id, rating: starRating });
      
      // Salvar avaliação na API
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          trainingId: id,
          rating: starRating
        }),
      });

      const result = await response.json();
      console.log('📥 Resposta da API ratings:', result);

      if (response.ok) {
        setRating(starRating);
        console.log('✅ Avaliação salva com sucesso');
      } else {
        console.error('❌ Erro ao salvar avaliação:', result.error);
        alert('Erro ao salvar avaliação: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar avaliação:', error);
      alert('Erro ao salvar avaliação. Tente novamente.');
    } finally {
      setUpdatingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando treinamento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Treinamento não encontrado
              </h1>
              <p className="text-gray-600 mb-6">
                O treinamento que você está procurando não existe ou foi removido.
              </p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-6">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Vídeo Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                  {training.videoUrl ? (
                    <video 
                      controls 
                      className="w-full h-full"
                      poster="/api/placeholder/800/450"
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                    >
                      <source src={training.videoUrl} type="video/mp4" />
                      Seu navegador não suporta vídeos.
                    </video>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Vídeo não disponível</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {training.title}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {training.createdAt.toDate().toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Instrutor
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-blue max-w-none"
                    dangerouslySetInnerHTML={{ __html: training.description }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com informações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso do Treinamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="font-medium">{Math.max(progress, videoProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.max(progress, videoProgress)}%` }}
                      />
                    </div>
                    
                    {/* Informações detalhadas do progresso */}
                    <div className="text-xs text-gray-500 space-y-1">
                      {videoProgress > 0 && (
                        <div className="flex justify-between">
                          <span>Progresso atual do vídeo:</span>
                          <span>{videoProgress}%</span>
                        </div>
                      )}
                      {progress > 0 && progress !== videoProgress && (
                        <div className="flex justify-between">
                          <span>Progresso salvo:</span>
                          <span>{progress}%</span>
                        </div>
                      )}
                      {videoDuration > 0 && watchedTime > 0 && (
                        <div className="flex justify-between">
                          <span>Tempo assistido:</span>
                          <span>{Math.round(watchedTime / 60)}min de {Math.round(videoDuration / 60)}min</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Botão para retomar de onde parou */}
                    {progress > 10 && progress < 100 && videoElement && !isCompleted && (
                      <Button 
                        onClick={() => handleSeekToProgress(progress)} 
                        variant="secondary"
                        size="sm" 
                        className="w-full"
                      >
                        📍 Retomar de {progress}%
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => updateProgress(50)} 
                      variant={progress >= 50 ? "default" : "outline"}
                      size="sm" 
                      className="w-full"
                      disabled={updatingProgress || progress >= 50}
                    >
                      {progress >= 50 ? "✅ 50% Concluído" : "Marcar como 50% concluído"}
                    </Button>
                    
                    <Button 
                      onClick={() => updateProgress(100, true)} 
                      variant={isCompleted ? "default" : "outline"}
                      size="sm" 
                      className="w-full"
                      disabled={updatingProgress || isCompleted}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isCompleted ? "✅ Concluído" : "Marcar como concluído"}
                    </Button>
                    
                    {/* Status do progresso automático */}
                    {videoProgress > 0 && videoProgress !== progress && !isCompleted && (
                      <div className="text-center text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        📹 Progresso sendo atualizado automaticamente...
                      </div>
                    )}
                    
                    {isCompleted && (
                      <div className="text-center text-green-600 text-sm font-medium bg-green-50 p-2 rounded">
                        🎉 Treinamento concluído!
                      </div>
                    )}
                    
                    {videoProgress >= 97 && videoProgress < 99 && !isCompleted && (
                      <div className="text-center text-orange-600 text-xs bg-orange-50 p-2 rounded">
                        ⏱️ Quase terminando! Continue assistindo para marcar como concluído.
                      </div>
                    )}
                    
                    {videoProgress >= 99 && !isCompleted && (
                      <div className="text-center text-green-600 text-xs bg-green-50 p-2 rounded">
                        ✅ Vídeo quase concluído! Processando...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avaliação do Treinamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Como você avalia este treinamento?</h4>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          data-star-rating={star}
                          onClick={() => handleStarClick(star)}
                          className={`text-2xl transition-colors ${
                            star <= rating 
                              ? 'text-yellow-400 hover:text-yellow-500' 
                              : 'text-gray-300 hover:text-yellow-300'
                          } ${updatingRating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          disabled={updatingRating}
                          title={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                      {updatingRating && (
                        <span className="text-sm text-gray-500 ml-2">Salvando...</span>
                      )}
                    </div>
                    {rating > 0 && (
                      <p className="text-sm text-gray-600">
                        {rating === 1 && "Precisa melhorar"}
                        {rating === 2 && "Regular"}
                        {rating === 3 && "Bom"}
                        {rating === 4 && "Muito bom"}
                        {rating === 5 && "Excelente"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>O que você vai aprender</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Verificar se há objetivos de aprendizado */}
                {(training.learningObjective1 || training.learningObjective2 || training.learningObjective3 || training.learningObjective4) ? (
                  <ul className="space-y-2 text-sm text-gray-600">
                    {training.learningObjective1 && (
                      <li className="flex items-start">
                        <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {training.learningObjective1}
                      </li>
                    )}
                    {training.learningObjective2 && (
                      <li className="flex items-start">
                        <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {training.learningObjective2}
                      </li>
                    )}
                    {training.learningObjective3 && (
                      <li className="flex items-start">
                        <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {training.learningObjective3}
                      </li>
                    )}
                    {training.learningObjective4 && (
                      <li className="flex items-start">
                        <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {training.learningObjective4}
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Objetivos de aprendizado não definidos para este treinamento.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
