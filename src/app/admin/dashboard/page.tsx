'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Upload, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Administrativo
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie a plataforma de treinamento e desenvolvimento
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gerenciar Usuários */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    <CardTitle>Gerenciar Usuários</CardTitle>
                  </div>
                  <CardDescription>
                    Visualize e gerencie os usuários da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Adicione novos usuários, gerencie permissões e visualize a lista de usuários cadastrados.
                  </p>
                  <Link href="/admin/users">
                    <Button className="w-full">
                      Acessar Usuários
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Upload de Treinamentos */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Upload className="h-6 w-6 text-green-600" />
                    <CardTitle>Upload de Treinamento</CardTitle>
                  </div>
                  <CardDescription>
                    Adicione novos treinamentos à plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Faça upload de vídeos, adicione descrições e disponibilize novos conteúdos de treinamento.
                  </p>
                  <Link href="/admin/upload">
                    <Button className="w-full">
                      Fazer Upload
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Configurações */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-6 w-6 text-gray-600" />
                    <CardTitle>Configurações</CardTitle>
                  </div>
                  <CardDescription>
                    Configure as opções da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Ajuste configurações gerais, preferências e parâmetros da plataforma.
                  </p>
                  <Button className="w-full" variant="outline" disabled>
                    Em Breve
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Visão Geral
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">--</p>
                      <p className="text-sm text-gray-600">Total de Usuários</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">--</p>
                      <p className="text-sm text-gray-600">Treinamentos</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">--</p>
                      <p className="text-sm text-gray-600">Avaliações</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">--</p>
                      <p className="text-sm text-gray-600">Média Geral</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
