'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainings } from '@/contexts/TrainingsContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export default function AdminUploadPage() {
  const { user } = useAuth();
  const { addTraining } = useTrainings();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo de vídeo
      if (!file.type.startsWith('video/')) {
        toast.error('Por favor, selecione um arquivo de vídeo válido.');
        return;
      }
      
      // Verificar tamanho do arquivo (máximo 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        toast.error('O arquivo deve ter no máximo 500MB.');
        return;
      }
      
      setVideo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !video) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!storage || !db) {
      // Modo de teste - simular upload
      toast.info('Modo de teste: simulando upload...');
      setUploading(true);
      setUploadProgress(0);

      // Simular progresso de upload
      const simulateProgress = () => {
        return new Promise<void>((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
              progress = 100;
              setUploadProgress(100);
              clearInterval(interval);
              resolve();
            } else {
              setUploadProgress(progress);
            }
          }, 200);
        });
      };

      try {
        await simulateProgress();
        
        // Simular delay de processamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Adicionar treinamento ao contexto global
        const trainingId = addTraining({
          title,
          description,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // URL de vídeo mock
          uploaderId: user.uid
        });
        
        toast.success('Treinamento criado com sucesso! (Modo de teste)');
        console.log('Treinamento adicionado:', trainingId);
        
        // Limpar formulário
        setTitle('');
        setDescription('');
        setVideo(null);
        setUploadProgress(0);
        
        // Reset do input de arquivo
        const fileInput = document.getElementById('video') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } catch (error) {
        console.error('Erro na simulação:', error);
        toast.error('Erro na simulação de upload');
      } finally {
        setUploading(false);
      }
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload do vídeo para o Firebase Storage
      const videoRef = ref(storage, `trainings/${Date.now()}_${video.name}`);
      const uploadTask = uploadBytesResumable(videoRef, video);

      // Monitorar progresso do upload
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Erro no upload:', error);
          toast.error('Erro ao fazer upload do vídeo');
          setUploading(false);
        },
        async () => {
          try {
            // Upload concluído, obter URL do vídeo
            const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Verificar se o db está disponível
            if (!db) {
              throw new Error('Firestore não configurado');
            }
            
            // Salvar dados do treinamento no Firestore
            await addDoc(collection(db, 'trainings'), {
              title,
              description,
              videoUrl,
              uploaderId: user.uid,
              createdAt: serverTimestamp()
            });

            // Adicionar treinamento ao contexto global também
            addTraining({
              title,
              description,
              videoUrl,
              uploaderId: user.uid
            });

            toast.success('Treinamento criado com sucesso!');
            
            // Limpar formulário
            setTitle('');
            setDescription('');
            setVideo(null);
            setUploadProgress(0);
            
            // Reset do input de arquivo
            const fileInput = document.getElementById('video') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }
          } catch (error) {
            console.error('Erro ao salvar treinamento:', error);
            toast.error('Erro ao salvar treinamento no banco de dados');
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Erro ao iniciar upload:', error);
      toast.error('Erro ao iniciar upload');
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Upload de Treinamento
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Adicione um novo treinamento à plataforma
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Novo Treinamento</span>
                </CardTitle>
                <CardDescription>
                  Preencha os dados e faça upload do vídeo de treinamento
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Treinamento</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Digite o título do treinamento"
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Digite a descrição do treinamento..."
                      className="min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                      disabled={uploading}
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Você pode usar HTML básico como &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video">Vídeo do Treinamento</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      required
                      disabled={uploading}
                    />
                    {video && (
                      <p className="text-sm text-gray-600">
                        Arquivo selecionado: {video.name} ({(video.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <Label>Progresso do Upload</Label>
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-600">
                        {uploadProgress.toFixed(1)}% concluído
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={uploading}
                  >
                    {uploading ? 'Fazendo Upload...' : 'Criar Treinamento'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
