
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket, TrendingUp, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalSectors: 0,
    totalSeats: 0,
    totalTickets: 0,
    pendingTickets: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas de jogos
      const { count: gamesCount } = await supabase
        .from('games')
        .select('id', { count: 'exact' });

      // Buscar estatísticas de setores
      const { count: sectorsCount } = await supabase
        .from('sectors')
        .select('id', { count: 'exact' });

      // Buscar estatísticas de assentos
      const { count: seatsCount } = await supabase
        .from('seats')
        .select('id', { count: 'exact' });

      // Buscar estatísticas de bilhetes
      const { count: ticketsCount } = await supabase
        .from('tickets')
        .select('id', { count: 'exact' });

      // Buscar bilhetes pendentes
      const { count: pendingCount } = await supabase
        .from('tickets')
        .select('id', { count: 'exact' })
        .eq('status_pagamento', 'pendente');

      setStats({
        totalGames: gamesCount || 0,
        totalSectors: sectorsCount || 0,
        totalSeats: seatsCount || 0,
        totalTickets: ticketsCount || 0,
        pendingTickets: pendingCount || 0,
        revenue: 0, // Calcular receita se necessário
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Jogos',
      value: stats.totalGames,
      description: 'Total de jogos cadastrados',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/games',
    },
    {
      title: 'Setores',
      value: stats.totalSectors,
      description: 'Setores do estádio',
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/sectors',
    },
    {
      title: 'Assentos',
      value: stats.totalSeats,
      description: 'Total de assentos disponíveis',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/seats',
    },
    {
      title: 'Bilhetes',
      value: stats.totalTickets,
      description: 'Bilhetes vendidos',
      icon: Ticket,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/admin/tickets',
    },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600">Visão geral do sistema de bilhetes</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-xs text-gray-600 mt-1">{card.description}</p>
                <Link to={card.link}>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Gerenciar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cards de Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-sagrada-green" />
              Bilhetes Pendentes
            </CardTitle>
            <CardDescription>
              Bilhetes aguardando confirmação de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-4">
              {stats.pendingTickets}
            </div>
            <Link to="/admin/tickets">
              <Button className="bg-sagrada-green hover:bg-sagrada-green/90">
                Ver Bilhetes Pendentes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-sagrada-green" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/games">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Adicionar Novo Jogo
              </Button>
            </Link>
            <Link to="/admin/sectors">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Configurar Setores
              </Button>
            </Link>
            <Link to="/admin/seats">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Assentos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
