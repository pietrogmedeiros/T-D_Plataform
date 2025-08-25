'use client';

import { useState } from 'react';
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
  const { refreshTrainings } = useTrainings();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Learning objectives states
  const [learningObjective1, setLearningObjective1] = useState('');
  const [learningObjective2, setLearningObjective2] = useState('');
  const [learningObjective3, setLearningObjective3] = useState('');
  const [learningObjective4, setLearningObjective4] = useState('');

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Por favor, selecione um arquivo de vídeo válido.');
        return;
      }
      
      const maxSize = 1024 * 1024 * 1024; // 1GB
      if (file.size > maxSize) {
        toast.error('O arquivo deve ter no máximo 1GB.');
        return;
      }
      
      setVideo(file);
    }
  };

  const uploadVideoInChunks = async (file: File): Promise<{
    success: boolean;
    videoUrl: string;
    videoPath: string;
    fileName: string;
  }> => {
    try {
      console.log('� Iniciando upload por chunks...');
      
      const chunkSize = 5 * 1024 * 1024; // 5MB por chunk
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      console.log(`📊 Arquivo será dividido em ${totalChunks} chunks de ~5MB`);

      let uploadedChunks = 0;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        console.log(`📤 Enviando chunk ${chunkIndex + 1}/${totalChunks}...`);

        const formData = new FormData();
        formData.append('video', chunk);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileName', file.name);

        const response = await fetch('/api/upload/chunks', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Erro no chunk ${chunkIndex + 1}`);
        }

        const result = await response.json();
        uploadedChunks++;

        // Atualizar progresso
        const progress = Math.round((uploadedChunks / totalChunks) * 85);
        setUploadProgress(progress);

        console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} enviado`);

        // Se é o último chunk e está completo
        if (result.completed) {
          console.log('🎉 Upload completo!');
          return {
            success: true,
            videoUrl: result.videoUrl,
            videoPath: result.videoPath,
            fileName: result.fileName,
          };
        }
      }

      throw new Error('Upload não foi completado corretamente');

    } catch (error) {
      console.error('❌ Erro no upload por chunks:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !video) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    console.log('🚀 Iniciando upload:', { title, description, videoName: video.name });
    
    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Fazer upload do vídeo por chunks
      console.log('📤 Iniciando upload por chunks...');
      
      const uploadData = await uploadVideoInChunks(video);
      console.log('✅ Upload do vídeo concluído:', uploadData);
      
      setUploadProgress(95);

      // 2. Criar o treinamento no banco
      console.log('💾 Salvando treinamento no banco...');
      
      const trainingResponse = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          videoUrl: uploadData.videoUrl,
          videoPath: uploadData.videoPath,
          uploaderId: user.uid,
          status: 'PUBLISHED',
          learningObjective1: learningObjective1 || null,
          learningObjective2: learningObjective2 || null,
          learningObjective3: learningObjective3 || null,
          learningObjective4: learningObjective4 || null,
        }),
      });

      if (!trainingResponse.ok) {
        throw new Error('Erro ao salvar treinamento');
      }

      const newTraining = await trainingResponse.json();
      console.log('✅ Treinamento criado:', newTraining);
      
      setUploadProgress(100);
      toast.success(`🎉 Treinamento "${title}" criado com sucesso!`);
      
      // Atualizar lista de treinamentos
      console.log('🔄 Atualizando lista de treinamentos...');
      await refreshTrainings();
      
      // Limpar formulário
      setTitle('');
      setDescription('');
      setVideo(null);
      setLearningObjective1('');
      setLearningObjective2('');
      setLearningObjective3('');
      setLearningObjective4('');
      setUploadProgress(0);
      
      const fileInput = document.getElementById('video') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('❌ Erro no processo:', error);
      setUploadProgress(0);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar treinamento');
    } finally {
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

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">O que o usuário irá aprender nesse treinamento?</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="objective1">Objetivo de Aprendizado 1</Label>
                        <Input
                          id="objective1"
                          type="text"
                          value={learningObjective1}
                          onChange={(e) => setLearningObjective1(e.target.value)}
                          placeholder="Ex: Conceitos fundamentais"
                          disabled={uploading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="objective2">Objetivo de Aprendizado 2</Label>
                        <Input
                          id="objective2"
                          type="text"
                          value={learningObjective2}
                          onChange={(e) => setLearningObjective2(e.target.value)}
                          placeholder="Ex: Aplicação prática"
                          disabled={uploading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="objective3">Objetivo de Aprendizado 3</Label>
                        <Input
                          id="objective3"
                          type="text"
                          value={learningObjective3}
                          onChange={(e) => setLearningObjective3(e.target.value)}
                          placeholder="Ex: Melhores práticas"
                          disabled={uploading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="objective4">Objetivo de Aprendizado 4</Label>
                        <Input
                          id="objective4"
                          type="text"
                          value={learningObjective4}
                          onChange={(e) => setLearningObjective4(e.target.value)}
                          placeholder="Ex: Exercícios práticos"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Estes campos são opcionais, mas ajudam os usuários a entender o que vão aprender.
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
