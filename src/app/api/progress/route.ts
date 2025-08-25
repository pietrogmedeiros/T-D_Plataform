import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Buscar progresso do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'UserId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('📊 API Progress GET: Buscando progresso para usuário:', userId);

    // Buscar progresso do usuário
    const userProgress = await prisma.$queryRaw`
      SELECT * FROM user_progress WHERE "userId" = ${userId}
    `;

    // Buscar total de treinamentos
    const totalTrainings = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM trainings
    `;

    // Calcular estatísticas
    const progressData = Array.isArray(userProgress) ? userProgress : [];
    const completedCount = progressData.filter((p: { completed: boolean }) => p.completed).length;
    const totalCount = Array.isArray(totalTrainings) && totalTrainings[0] ? Number((totalTrainings[0] as { count: number }).count) : 0;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const result = {
      userProgress: progressData,
      statistics: {
        totalTrainings: totalCount,
        completedTrainings: completedCount,
        completionPercentage
      }
    };

    console.log('✅ Estatísticas calculadas:', result.statistics);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Erro ao buscar progresso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST: Atualizar progresso do usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, trainingId, progress, completed } = body;

    if (!userId || !trainingId) {
      return NextResponse.json(
        { error: 'UserId e trainingId são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('📊 API Progress POST: Atualizando progresso:', { userId, trainingId, progress, completed });

    // Atualizar ou criar progresso
    const now = new Date();
    const completedAt = completed ? now : null;

    await prisma.$executeRaw`
      INSERT INTO user_progress ("userId", "trainingId", progress, completed, "completedAt", "createdAt", "updatedAt")
      VALUES (${userId}, ${trainingId}, ${progress || 0}, ${Boolean(completed)}, ${completedAt}, ${now}, ${now})
      ON CONFLICT ("userId", "trainingId") 
      DO UPDATE SET 
        progress = ${progress || 0},
        completed = ${Boolean(completed)},
        "completedAt" = ${completedAt},
        "updatedAt" = ${now}
    `;

    console.log('✅ Progresso atualizado com sucesso');

    return NextResponse.json({ 
      success: true,
      message: 'Progresso atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar progresso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
