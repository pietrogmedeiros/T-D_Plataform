'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import webLogo from '@/assets/web.png';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Image
                src={webLogo}
                alt="Logo T&D Webcontinental"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">
                T&D Webcontinental
              </span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              
              <Link 
                href="/test-firebase" 
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                🔥 Test Firebase
              </Link>
              
              {user.role === 'admin' && (
                <>
                  <Link 
                    href="/admin/dashboard" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Admin
                  </Link>
                  <Link 
                    href="/admin/users" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Usuários
                  </Link>
                  <Link 
                    href="/admin/upload" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Upload
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Olá, {user.displayName || user.email}
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {user.role === 'admin' ? 'Admin' : 'Usuário'}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
