'use client';

import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestFirebasePage() {
  const { isTestMode, user } = useAuth();
  const [firebaseStatus, setFirebaseStatus] = useState({
    auth: false,
    firestore: false,
    storage: false,
    loading: true
  });

  useEffect(() => {
    const testFirebaseConnection = async () => {
      const status = {
        auth: !!auth,
        firestore: !!db,
        storage: !!storage,
        loading: false
      };
      
      console.log('🔥 Status do Firebase:', status);
      console.log('📊 Modo de teste:', isTestMode);
      
      setFirebaseStatus(status);
    };

    testFirebaseConnection();
  }, [isTestMode]);

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔥 Teste de Conexão Firebase</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isTestMode ? 
                  <AlertCircle className="w-5 h-5 text-yellow-500" /> : 
                  <CheckCircle className="w-5 h-5 text-green-500" />
                }
                Status da Aplicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Modo:</strong> {isTestMode ? '🧪 Teste (Mock)' : '🔥 Firebase'}</p>
                <p><strong>Usuário:</strong> {user ? `${user.displayName} (${user.role})` : 'Não logado'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Serviços Firebase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Authentication</span>
                  <StatusIcon status={firebaseStatus.auth} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Firestore</span>
                  <StatusIcon status={firebaseStatus.firestore} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Storage</span>
                  <StatusIcon status={firebaseStatus.storage} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Variáveis de Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurada' : '❌ Não encontrada'}</p>
                <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Não encontrada'}</p>
                <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Não encontrada'}</p>
              </div>
              <div>
                <p><strong>Storage Bucket:</strong> {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ Não encontrada'}</p>
                <p><strong>Messaging Sender ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '❌ Não encontrada'}</p>
                <p><strong>App ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '❌ Não encontrada'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🧪 Teste - Credenciais Mock</CardTitle>
              <CardDescription>Para testar sem Firebase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Admin:</strong> admin@teste / admin123</p>
              <p><strong>Usuário:</strong> teste@teste / 12345</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔥 Produção - Firebase</CardTitle>
              <CardDescription>Usuários reais do Firebase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Crie usuários via:</p>
              <p>• Firebase Console</p>
              <p>• Página Admin → Usuários</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={() => window.location.href = '/login'}
            className="mr-4"
          >
            Ir para Login
          </Button>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
