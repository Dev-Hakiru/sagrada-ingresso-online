
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Download, Search, Edit, Trash2 } from 'lucide-react';

interface Ticket {
  id: string;
  user_id: string;
  game_id: string;
  game_title: string;
  date: string;
  time: string;
  stadium: string;
  seats: any;
  status_pagamento: string;
  created_at: string;
}

interface Game {
  id: string;
  nome_jogo: string;
}

const TicketsManagement = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar bilhetes
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);

      // Buscar jogos
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('id, nome_jogo')
        .order('nome_jogo', { ascending: true });

      if (gamesError) throw gamesError;
      setGames(gamesData || []);

    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este bilhete?')) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Bilhete excluído com sucesso!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao excluir bilhete:', error);
      toast.error('Erro ao excluir bilhete');
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status_pagamento: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      toast.success('Status atualizado com sucesso!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Jogo', 'Data', 'Hora', 'Assentos', 'Status', 'Data Compra'].join(','),
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.game_title,
        ticket.date,
        ticket.time,
        JSON.stringify(ticket.seats),
        ticket.status_pagamento || 'pendente',
        new Date(ticket.created_at).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bilhetes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Arquivo CSV baixado com sucesso!');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.game_title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === '' || ticket.status_pagamento === statusFilter;
    const matchesGame = gameFilter === '' || ticket.game_id === gameFilter;
    
    return matchesSearch && matchesStatus && matchesGame;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSeatsInfo = (seats: any) => {
    if (!seats || !Array.isArray(seats)) return '-';
    return seats.map(seat => `${seat.section}${seat.row}${seat.number}`).join(', ');
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">🎟️ Gerenciar Bilhetes</h2>
          <p className="text-gray-600">Gerencie todos os bilhetes vendidos</p>
        </div>
        
        <Button onClick={exportToCSV} className="bg-sagrada-green hover:bg-sagrada-green/90">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Bilhetes</CardTitle>
              <CardDescription>
                {filteredTickets.length} bilhete(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar bilhetes..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-48"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Jogo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.nome_jogo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchFilter || statusFilter || gameFilter ? 'Nenhum bilhete encontrado.' : 'Nenhum bilhete vendido ainda.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Jogo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Assentos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Compra</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">{ticket.id.substring(0, 8)}...</TableCell>
                    <TableCell className="max-w-xs truncate">{ticket.game_title}</TableCell>
                    <TableCell>{ticket.date}</TableCell>
                    <TableCell>{ticket.time}</TableCell>
                    <TableCell className="max-w-xs truncate">{getSeatsInfo(ticket.seats)}</TableCell>
                    <TableCell>
                      <Select
                        value={ticket.status_pagamento || 'pendente'}
                        onValueChange={(value) => handleStatusUpdate(ticket.id, value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatDate(ticket.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsManagement;
