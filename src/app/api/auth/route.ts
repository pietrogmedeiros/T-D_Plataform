import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - Fazer login
export async function POST(request: NextRequest) {
  try {
    console.log('📡 API Auth: Recebendo requisição de login...');
    const body = await request.json();
    const { email, password } = body;

    // Validação básica
    if (!email || !password) {
      console.log('❌ API Auth: Email ou senha não fornecidos');
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔍 API Auth: Validando credenciais para:', email);

    // Buscar usuário no banco primeiro
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
      },
    });

    if (user) {
      // Se usuário existe no PostgreSQL, verificar senhas específicas
      let isValidPassword = false;
      
      // Senha específica para Pietro Medeiros
      if (user.email === 'pietro.medeiros@webcontinental.com.br' && password === 'P@ula07021995') {
        isValidPassword = true;
      }
      // Senha padrão para outros usuários
      else if (password === '123456') {
        isValidPassword = true;
      }
      
      if (isValidPassword) {
        console.log('✅ API Auth: Login bem-sucedido (PostgreSQL) para:', email, 'Role:', user.role);
        
        const authUser = {
          uid: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role.toLowerCase() as 'admin' | 'user',
        };

        return NextResponse.json({ user: authUser });
      } else {
        console.log('❌ API Auth: Senha incorreta para usuário PostgreSQL:', email);
        return NextResponse.json(
          { error: 'Senha incorreta' },
          { status: 401 }
        );
      }
    }

    // Fallback para credenciais fixas (modo teste)
    const validCredentials = [
      { email: 'admin@teste', password: 'admin123' },
      { email: 'teste@teste', password: '12345' }
    ];

    const isValidCredential = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!isValidCredential) {
      console.log('❌ API Auth: Credenciais inválidas para:', email);
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    console.log('✅ API Auth: Login bem-sucedido (modo teste) para:', email);
    
    // Retornar dados mock para credenciais de teste
    const mockUser = {
      uid: 'mock-' + email.replace('@', '-'),
      email: email,
      displayName: email === 'admin@teste' ? 'Admin Teste' : 'Usuário Teste',
      role: email === 'admin@teste' ? 'admin' as const : 'user' as const,
    };

    return NextResponse.json({ user: mockUser });
  } catch (error) {
    console.error('❌ API Auth: Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
