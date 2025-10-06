import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

interface Training {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  videoPath?: string;
  uploaderId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  learningObjective1?: string;
  learningObjective2?: string;
  learningObjective3?: string;
  learningObjective4?: string;
  createdAt: string;
  updatedAt: string;
}

// GET - Listar todos os treinamentos
export async function GET() {
  try {
    const trainings = await DynamoDBService.getAllTrainings();

    // Para cada treinamento, buscar dados do uploader
    const trainingsWithUploader = await Promise.all(
      (trainings as Training[]).map(async (training: Training) => {
        const uploader = await DynamoDBService.getUserById(training.uploaderId);
        return {
          ...training,
          uploader: uploader ? {
            displayName: uploader.displayName,
            email: uploader.email,
          } : null,
        };
      })
    );

    const response = NextResponse.json(trainingsWithUploader);
    
    // Headers para evitar cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('Erro ao buscar treinamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar treinamentos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo treinamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      videoUrl, 
      videoPath, 
      uploaderId, 
      status,
      learningObjective1,
      learningObjective2,
      learningObjective3,
      learningObjective4
    } = body;

    // Validação básica
    if (!title || !description || !uploaderId) {
      return NextResponse.json(
        { error: 'Título, descrição e uploaderId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await DynamoDBService.getUserById(uploaderId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const newTraining: Training = {
      id: randomUUID(),
      title,
      description,
      videoUrl,
      videoPath,
      uploaderId,
      status: (status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') || 'DRAFT',
      learningObjective1,
      learningObjective2,
      learningObjective3,
      learningObjective4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.createTraining(newTraining);

    const trainingWithUploader = {
      ...newTraining,
      uploader: {
        displayName: user.displayName,
        email: user.email,
      },
    };

    return NextResponse.json(trainingWithUploader, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar treinamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar treinamento' },
      { status: 500 }
    );
  }
}
