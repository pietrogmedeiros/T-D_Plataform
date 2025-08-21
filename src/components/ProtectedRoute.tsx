'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Usuário não está logado, redirecionar para login
        router.push('/login');
        return;
      }

      if (requireAdmin && user.role !== 'admin') {
        // Usuário não é admin, redirecionar para dashboard
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, requireAdmin, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Se não está logado, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  // Se requer admin e não é admin, não renderizar nada (será redirecionado)
  if (requireAdmin && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
