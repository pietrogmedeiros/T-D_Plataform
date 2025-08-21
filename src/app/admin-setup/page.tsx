'use client';

import { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Tipo para Firebase User
type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export default function AdminSetupPage() {
  const { firebaseUser, isTestMode } = useAuth();
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Em modo de teste, não precisamos desta página
  if (isTestMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Setup Admin</CardTitle>
            <CardDescription>
              Esta página não é necessária em modo de teste.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              O sistema está rodando em modo de teste. Use as credenciais de teste para acessar como admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const promoteToAdmin = async () => {
    if (!firebaseUser || !db) {
      setStatus('❌ Firebase não configurado ou usuário não logado');
      return;
    }

    if ((firebaseUser as FirebaseUser)?.email !== 'pietro.medeiros@webcontinental.com.br') {
      setStatus('❌ Apenas o usuário pietro.medeiros@webcontinental.com.br pode ser promovido automaticamente');
      return;
    }

    setLoading(true);
    try {
      // Buscar documento atual
      const userDoc = await getDoc(doc(db, 'users', (firebaseUser as FirebaseUser).uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStatus(`📋 Usuário encontrado: ${userData.email} (${userData.role})`);
        
        if (userData.role !== 'admin') {
          // Atualizar para admin
          const updatedUser = {
            ...userData,
            role: 'admin',
            updatedAt: new Date().toISOString()
          };
          
          await setDoc(doc(db, 'users', (firebaseUser as FirebaseUser).uid), updatedUser);
          setStatus('✅ Usuário promovido para admin com sucesso!');
        } else {
          setStatus('✅ Usuário já é admin');
        }
      } else {
        // Criar usuário admin
        const newAdminUser = {
          uid: (firebaseUser as FirebaseUser).uid,
          email: (firebaseUser as FirebaseUser).email,
          displayName: (firebaseUser as FirebaseUser).displayName || 'Pietro Medeiros',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', (firebaseUser as FirebaseUser).uid), newAdminUser);
        setStatus('✅ Usuário admin criado com sucesso!');
      }
    } catch (error) {
      console.error('Erro:', error);
      setStatus(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🛠️ Configuração de Admin</CardTitle>
            <CardDescription>
              Ferramenta para configurar permissões de administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Status do Usuário:</h3>
              <p className="text-sm">
                Email: {(firebaseUser as unknown as FirebaseUser)?.email || 'Não logado'}<br/>
                UID: {(firebaseUser as unknown as FirebaseUser)?.uid?.substring(0, 8) || 'N/A'}...
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Ações:</h3>
              <Button 
                onClick={promoteToAdmin} 
                disabled={loading || !firebaseUser}
                className="w-full"
              >
                {loading ? 'Processando...' : 'Configurar como Admin'}
              </Button>
            </div>

            {status && (
              <div className="space-y-2">
                <h3 className="font-semibold">Resultado:</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  {status}
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs text-gray-600">
              <p>
                📝 Esta página é uma ferramenta administrativa para configurar 
                o usuário pietro.medeiros@webcontinental.com.br como administrador principal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
