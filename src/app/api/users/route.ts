import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Listar todos os usuários
export async function GET() {
  try {
    console.log('📡 API Users GET: Buscando usuários...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            trainings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Usuários encontrados:', users.length);
    
    // Mapear para o formato esperado pela página (name instead of displayName)
    const formattedUsers = users.map((user: typeof users[0]) => ({
      id: user.id,
      email: user.email,
      name: user.displayName, // Mapear displayName para name
      role: user.role,
      createdAt: user.createdAt,
      trainingsCount: user._count.trainings,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📡 API Users POST: Dados recebidos:', body);
    
    const { email, name, displayName, role } = body;
    
    // Usar 'name' ou 'displayName' (compatibilidade)
    const userDisplayName = name || displayName;

    // Validação básica
    if (!email || !userDisplayName) {
      console.error('❌ Validação falhou:', { email, userDisplayName });
      return NextResponse.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando se usuário já existe:', email);
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error('❌ Usuário já existe:', email);
      return NextResponse.json(
        { error: 'Usuário com este email já existe' },
        { status: 409 }
      );
    }

    console.log('✅ Criando usuário no PostgreSQL...');
    
    // Converter role para o formato do enum Prisma
    let prismaRole: 'USER' | 'ADMIN' = 'USER';
    if (role) {
      if (role.toLowerCase() === 'admin' || role === 'ADMIN') {
        prismaRole = 'ADMIN';
      } else {
        prismaRole = 'USER';
      }
    }
    
    console.log('🔄 Role convertido:', { original: role, converted: prismaRole });
    
    const user = await prisma.user.create({
      data: {
        email,
        displayName: userDisplayName,
        role: prismaRole,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('✅ Usuário criado com sucesso:', user);
    return NextResponse.json({ user, message: 'Usuário criado com sucesso!' }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
