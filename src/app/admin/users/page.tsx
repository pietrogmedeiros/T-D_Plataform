'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export default function AdminUsersPage() {
  const { signUp, isTestMode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (!db) {
        // Modo de teste - dados mock
        console.log('Modo de teste: carregando usuários mock');
        const mockUsers: User[] = [
          {
            uid: 'teste-admin-uid',
            email: 'teste@teste',
            displayName: 'Usuário Teste',
            role: 'admin'
          },
          {
            uid: 'mock-user-1',
            email: 'joao.silva@empresa.com',
            displayName: 'João Silva',
            role: 'user'
          },
          {
            uid: 'mock-user-2',
            email: 'maria.santos@empresa.com',
            displayName: 'Maria Santos',
            role: 'user'
          },
          {
            uid: 'mock-admin-1',
            email: 'admin@empresa.com',
            displayName: 'Administrador',
            role: 'admin'
          }
        ];
        setUsers(mockUsers);
        return;
      }
      
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push(doc.data() as User);
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      if (isTestMode) {
        // Modo de teste - simular criação de usuário
        toast.info('Modo de teste: simulando criação de usuário...');
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newMockUser: User = {
          uid: `mock-${Date.now()}`,
          email: email,
          displayName: displayName,
          role: role
        };
        
        // Adicionar à lista atual
        setUsers(prev => [...prev, newMockUser]);
        
        toast.success('Usuário criado com sucesso! (Modo de teste)');
        
        // Limpar formulário
        setEmail('');
        setDisplayName('');
        setPassword('');
        setRole('user');
        setDialogOpen(false);
        return;
      }

      // Usar a função signUp do AuthContext
      await signUp(email, password, displayName, role);

      toast.success('Usuário criado com sucesso!');
      
      // Limpar formulário
      setEmail('');
      setDisplayName('');
      setPassword('');
      setRole('user');
      setDialogOpen(false);
      
      // Recarregar lista de usuários
      fetchUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário. Verifique os dados e tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gerenciar Usuários
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Visualize e gerencie os usuários da plataforma
                </p>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Preencha os dados para criar um novo usuário na plataforma.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateUser}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Nome de Exibição</Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha Temporária</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Nível de Acesso</Label>
                        <select
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="user">Usuário</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>
                    
                    <DialogFooter className="mt-6">
                      <Button type="submit" disabled={creating}>
                        {creating ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usuários Cadastrados</CardTitle>
                <CardDescription>
                  Lista de todos os usuários da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Nenhum usuário encontrado.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nível de Acesso</TableHead>
                        <TableHead>UID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell className="font-medium">
                            {user.displayName || '-'}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {user.uid}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
