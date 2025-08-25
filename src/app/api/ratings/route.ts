import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Buscar avaliação do usuário para um treinamento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const trainingId = searchParams.get('trainingId');
    
    if (!userId || !trainingId) {
      return NextResponse.json(
        { error: 'UserId e trainingId são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('⭐ API Rating GET: Buscando avaliação:', { userId, trainingId });

    // Buscar avaliação específica
    const rating = await prisma.$queryRaw`
      SELECT * FROM training_ratings 
      WHERE "userId" = ${userId} AND "trainingId" = ${trainingId}
    `;

    const result = Array.isArray(rating) && rating.length > 0 ? rating[0] : null;

    console.log('✅ Avaliação encontrada:', result?.rating || 'Sem avaliação');

    return NextResponse.json({ rating: result });
  } catch (error) {
    console.error('❌ Erro ao buscar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST: Salvar avaliação do usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, trainingId, rating } = body;

    if (!userId || !trainingId || !rating) {
      return NextResponse.json(
        { error: 'UserId, trainingId e rating são obrigatórios' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating deve ser entre 1 e 5' },
        { status: 400 }
      );
    }

    console.log('⭐ API Rating POST: Salvando avaliação:', { userId, trainingId, rating });

    // Salvar ou atualizar avaliação
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO training_ratings ("userId", "trainingId", rating, "createdAt", "updatedAt")
      VALUES (${userId}, ${trainingId}, ${rating}, ${now}, ${now})
      ON CONFLICT ("userId", "trainingId") 
      DO UPDATE SET 
        rating = ${rating},
        "updatedAt" = ${now}
    `;

    console.log('✅ Avaliação salva com sucesso');

    return NextResponse.json({ 
      success: true,
      message: 'Avaliação salva com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao salvar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
