'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import webLogo from '@/assets/web.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      console.log('👤 Usuário já logado, redirecionando...', user);
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔑 Iniciando processo de login...');
      await signIn(email, password);
      console.log('✅ Login realizado com sucesso');
      toast.success('Login realizado com sucesso!');
      
      // Aguardar um pouco para garantir que o estado seja atualizado
      setTimeout(() => {
        console.log('🔄 Redirecionando para dashboard...');
        router.push('/dashboard');
      }, 500);
    } catch (error) {
      console.error('❌ Erro no login:', error);
      toast.error('Erro no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {authLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      ) : (
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src={webLogo}
                alt="Logo T&D Webcontinental"
                width={120}
                height={120}
                className="h-20 w-auto"
                priority
              />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              T&D Webcontinental
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Faça login em sua conta
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Entrar</CardTitle>
              <CardDescription>
                Digite seu email e senha para acessar a plataforma
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              
              {/* Debug links temporários */}
              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <a href="/auth-debug" className="hover:text-blue-600">
                  Debug Auth
                </a>
                <a href="/dashboard" className="hover:text-blue-600">
                  Dashboard
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
        </div>
      )}
    </div>
  );
}
