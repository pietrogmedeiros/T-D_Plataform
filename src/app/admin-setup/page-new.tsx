'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Admin</CardTitle>
          <CardDescription>
            Sistema já configurado com PostgreSQL
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-green-600">
              ✅ A aplicação está usando PostgreSQL como banco principal
            </div>
            <div className="text-sm text-gray-600">
              Não é necessário configurar Firebase. Todos os usuários e dados estão no banco PostgreSQL.
            </div>
            
            <div className="pt-4">
              <Link href="/dashboard">
                <Button className="w-full">
                  Ir para Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
