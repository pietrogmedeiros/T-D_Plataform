import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

// GET - Listar todos os usuários
export async function GET() {
  try {
    console.log('📡 API Users GET: Buscando usuários...');
    
    const users = await DynamoDBService.getAllUsers();

    console.log('✅ Usuários encontrados:', users.length);
    
    // Mapear para o formato esperado pela página (name instead of displayName)
    const formattedUsers = (users as User[]).map((user: User) => ({
      id: user.id,
      email: user.email,
      name: user.displayName, // Mapear displayName para name
      role: user.role,
      createdAt: user.createdAt,
      trainingsCount: 0, // TODO: Implementar contagem real de treinamentos
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
    const existingUser = await DynamoDBService.getUserByEmail(email);

    if (existingUser) {
      console.error('❌ Usuário já existe:', email);
      return NextResponse.json(
        { error: 'Usuário com este email já existe' },
        { status: 409 }
      );
    }

    console.log('✅ Criando usuário no DynamoDB...');
    
    // Converter role para o formato correto
    let userRole: 'USER' | 'ADMIN' = 'USER';
    if (role) {
      if (role.toLowerCase() === 'admin' || role === 'ADMIN') {
        userRole = 'ADMIN';
      } else {
        userRole = 'USER';
      }
    }
    
    console.log('🔄 Role convertido:', { original: role, converted: userRole });
    
    const newUser: User = {
      id: randomUUID(),
      email,
      displayName: userDisplayName,
      role: userRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.createUser(newUser);

    console.log('✅ Usuário criado com sucesso:', newUser);
    return NextResponse.json({ 
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        createdAt: newUser.createdAt,
      }, 
      message: 'Usuário criado com sucesso!' 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
