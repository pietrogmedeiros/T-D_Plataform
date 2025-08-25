import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Buscar treinamento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const training = await prisma.training.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { error: 'Treinamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error('Erro ao buscar treinamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar treinamento' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar treinamento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, videoUrl, videoPath, status } = body;

    const training = await prisma.training.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(videoUrl && { videoUrl }),
        ...(videoPath && { videoPath }),
        ...(status && { status }),
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

    return NextResponse.json(training);
  } catch (error) {
    console.error('Erro ao atualizar treinamento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar treinamento' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar treinamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.training.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Treinamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar treinamento:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar treinamento' },
      { status: 500 }
    );
  }
}
