'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthDebugPage() {
  const { user, loading, isTestMode } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const log = (message: string) => {
      setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    log(`User: ${user ? `${user.displayName} (${user.role})` : 'null'}`);
    log(`Loading: ${loading}`);
    log(`Test Mode: ${isTestMode}`);
  }, [user, loading, isTestMode]);

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Debug de Autenticação</CardTitle>
            <CardDescription>
              Informações em tempo real sobre o estado da autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Estado Atual:</h3>
                <ul className="space-y-1 text-sm">
                  <li>Loading: <span className={loading ? 'text-yellow-600' : 'text-green-600'}>{loading ? 'true' : 'false'}</span></li>
                  <li>Test Mode: <span className={isTestMode ? 'text-blue-600' : 'text-gray-600'}>{isTestMode ? 'true' : 'false'}</span></li>
                  <li>User: <span className={user ? 'text-green-600' : 'text-red-600'}>{user ? 'Logado' : 'Não logado'}</span></li>
                  <li>Database: <span className="text-green-600">PostgreSQL</span></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">Dados do Usuário:</h3>
                {user ? (
                  <ul className="space-y-1 text-sm">
                    <li>Email: {user.email}</li>
                    <li>Nome: {user.displayName}</li>
                    <li>Role: <span className={user.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}>{user.role}</span></li>
                    <li>UID: {user.uid.substring(0, 8)}...</li>
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum usuário logado</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Actions:</h3>
              <div className="flex gap-2">
                <Button onClick={goToLogin} variant="outline">
                  Ir para Login
                </Button>
                <Button onClick={goToDashboard} disabled={!user}>
                  Ir para Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📝 Log de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-xs">
                {debugInfo.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔧 Testes Manuais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                1. Faça login em uma nova aba<br/>
                2. Volte para esta página para ver se o estado mudou<br/>
                3. Verifique o console do navegador para logs detalhados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
