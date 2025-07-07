
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Building2, Armchair, Ticket } from 'lucide-react';

interface DashboardStats {
  totalGames: number;
  totalSectors: number;
  totalSeats: number;
  totalTickets: number;
  availableSeats: number;
  soldTickets: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    totalSectors: 0,
    totalSeats: 0,
    totalTickets: 0,
    availableSeats: 0,
    soldTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Buscar contagem de jogos
      const { count: gamesCount } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true });

      // Buscar contagem de setores
      const { count: sectorsCount } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true });

      // Buscar contagem de assentos
      const { count: seatsCount } = await supabase
        .from('seats')
        .select('*', { count: 'exact', head: true });

      // Buscar contagem de assentos disponíveis
      const { count: availableSeatsCount } = await supabase
        .from('seats')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      // Buscar contagem de bilhetes
      const { count: ticketsCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      // Buscar contagem de bilhetes pagos
      const { count: soldTicketsCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status_pagamento', 'pago');

      setStats({
        totalGames: gamesCount || 0,
        totalSectors: sectorsCount || 0,
        totalSeats: seatsCount || 0,
        totalTickets: ticketsCount || 0,
        availableSeats: availableSeatsCount || 0,
        soldTickets: soldTicketsCount || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sagrada-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral do sistema de bilhetes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Jogos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground">
              Jogos cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Setores</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSectors}</div>
            <p className="text-xs text-muted-foreground">
              Setores configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assentos Disponíveis</CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableSeats}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalSeats} assentos totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilhetes Vendidos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldTickets}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalTickets} bilhetes totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Sistema</CardTitle>
            <CardDescription>
              Estatísticas gerais da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Ocupação</span>
              <span className="font-semibold">
                {stats.totalSeats > 0 
                  ? Math.round(((stats.totalSeats - stats.availableSeats) / stats.totalSeats) * 100)
                  : 0
                }%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bilhetes Pagos</span>
              <span className="font-semibold text-green-600">
                {stats.soldTickets}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bilhetes Pendentes</span>
              <span className="font-semibold text-yellow-600">
                {stats.totalTickets - stats.soldTickets}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Links para funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="/admin/games" 
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-sagrada-green mr-3" />
                <span className="font-medium">Gerenciar Jogos</span>
              </div>
            </a>
            <a 
              href="/admin/sectors" 
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-sagrada-green mr-3" />
                <span className="font-medium">Gerenciar Setores</span>
              </div>
            </a>
            <a 
              href="/admin/tickets" 
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Ticket className="h-5 w-5 text-sagrada-green mr-3" />
                <span className="font-medium">Ver Bilhetes</span>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
