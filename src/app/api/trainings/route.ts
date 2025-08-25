import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Listar todos os treinamentos
export async function GET() {
  try {
    const trainings = await prisma.training.findMany({
      include: {
        uploader: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response = NextResponse.json(trainings);
    
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
    const user = await prisma.user.findUnique({
      where: { id: uploaderId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const training = await prisma.training.create({
      data: {
        title,
        description,
        videoUrl,
        videoPath,
        uploaderId,
        status: status || 'DRAFT',
        learningObjective1,
        learningObjective2,
        learningObjective3,
        learningObjective4,
      },
      include: {
        uploader: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar treinamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar treinamento' },
      { status: 500 }
    );
  }
}
