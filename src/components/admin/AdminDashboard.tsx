import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket, TrendingUp, DollarSign } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminMenu from './AdminMenu';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalSectors: 0,
    totalSeats: 0,
    totalTickets: 0,
    pendingTickets: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState({
    ticketsByStatus: [],
    sectorCapacity: [],
    gamesByDate: [],
    recentTickets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas de jogos
      const { count: gamesCount } = await supabase
        .from('games')
        .select('id', { count: 'exact' });

      const { count: sectorsCount } = await supabase
        .from('sectors')
        .select('id', { count: 'exact' });

      const { count: seatsCount } = await supabase
        .from('seats')
        .select('id', { count: 'exact' });

      const { count: ticketsCount } = await supabase
        .from('tickets')
        .select('id', { count: 'exact' });

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
        revenue: 0,
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      // Bilhetes por status
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('status_pagamento');

      const statusCounts = ticketsData?.reduce((acc, ticket) => {
        const status = ticket.status_pagamento || 'pendente';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const ticketsByStatus = Object.entries(statusCounts || {}).map(([status, count]) => ({
        status,
        count,
        fill: status === 'pago' ? '#10b981' : status === 'pendente' ? '#f59e0b' : '#ef4444'
      }));

      // Capacidade por setor
      const { data: sectorsData } = await supabase
        .from('sectors')
        .select('nome_setor, capacidade');

      const sectorCapacity = sectorsData?.map(sector => ({
        name: sector.nome_setor,
        capacity: sector.capacidade,
        fill: '#3b82f6'
      })) || [];

      // Jogos por data (últimos 30 dias)
      const { data: gamesData } = await supabase
        .from('games')
        .select('data')
        .gte('data', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('data', { ascending: true });

      const gamesByDate = gamesData?.reduce((acc, game) => {
        const date = new Date(game.data).toLocaleDateString('pt-BR');
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []) || [];

      // Últimos bilhetes
      const { data: recentTicketsData } = await supabase
        .from('tickets')
        .select('id, game_title, status_pagamento, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setChartData({
        ticketsByStatus,
        sectorCapacity,
        gamesByDate,
        recentTickets: recentTicketsData || []
      });

    } catch (error) {
      console.error('Erro ao buscar dados dos gráficos:', error);
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

  const chartConfig = {
    count: {
      label: "Quantidade",
    },
    capacity: {
      label: "Capacidade",
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sagrada-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <AdminMenu />
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard Administrativo</h1>
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bilhetes por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Bilhetes por Status</CardTitle>
            <CardDescription>Distribuição dos bilhetes por status de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={chartData.ticketsByStatus}>
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Capacidade por Setor */}
        <Card>
          <CardHeader>
            <CardTitle>Capacidade Total por Setor</CardTitle>
            <CardDescription>Distribuição da capacidade dos setores</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={chartData.sectorCapacity}
                  dataKey="capacity"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.sectorCapacity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Jogos por Data */}
        <Card>
          <CardHeader>
            <CardTitle>Jogos Cadastrados por Data</CardTitle>
            <CardDescription>Evolução dos jogos cadastrados nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={chartData.gamesByDate}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Últimos Bilhetes */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Bilhetes Vendidos</CardTitle>
            <CardDescription>Os 5 bilhetes mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.recentTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum bilhete encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jogo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.recentTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="max-w-xs truncate">{ticket.game_title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status_pagamento === 'pago' 
                            ? 'bg-green-100 text-green-800' 
                            : ticket.status_pagamento === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ticket.status_pagamento || 'pendente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4">
              <Link to="/admin/tickets">
                <Button variant="outline" className="w-full">
                  Ver Todos os Bilhetes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
