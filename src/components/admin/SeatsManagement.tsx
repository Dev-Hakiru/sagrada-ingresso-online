
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface Seat {
  id: string;
  game_id: string;
  section: string;
  row: string;
  number: number;
  status: string;
  setor_id: string | null;
  codigo_assento: string | null;
  created_at: string;
}

interface Game {
  id: string;
  nome_jogo: string;
}

interface Sector {
  id: string;
  nome_setor: string;
}

const SeatsManagement = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [formData, setFormData] = useState({
    game_id: '',
    section: '',
    row: '',
    number: '',
    setor_id: '',
    status: 'available',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar assentos
      const { data: seatsData, error: seatsError } = await supabase
        .from('seats')
        .select('*')
        .order('game_id', { ascending: true });

      if (seatsError) throw seatsError;
      setSeats(seatsData || []);

      // Buscar jogos
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('id, nome_jogo')
        .order('nome_jogo', { ascending: true });

      if (gamesError) throw gamesError;
      setGames(gamesData || []);

      // Buscar setores
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, nome_setor')
        .order('nome_setor', { ascending: true });

      if (sectorsError) throw sectorsError;
      setSectors(sectorsData || []);

    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const seatData = {
        game_id: formData.game_id,
        section: formData.section,
        row: formData.row,
        number: parseInt(formData.number),
        setor_id: formData.setor_id || null,
        status: formData.status,
        codigo_assento: `${formData.section}${formData.row}${formData.number.padStart(2, '0')}`,
      };

      if (editingSeat) {
        const { error } = await supabase
          .from('seats')
          .update(seatData)
          .eq('id', editingSeat.id);

        if (error) throw error;
        toast.success('Assento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('seats')
          .insert([seatData]);

        if (error) throw error;
        toast.success('Assento criado com sucesso!');
      }

      fetchData();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar assento:', error);
      toast.error('Erro ao salvar assento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este assento?')) return;

    try {
      const { error } = await supabase
        .from('seats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Assento excluído com sucesso!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao excluir assento:', error);
      toast.error('Erro ao excluir assento');
    }
  };

  const resetForm = () => {
    setFormData({
      game_id: '',
      section: '',
      row: '',
      number: '',
      setor_id: '',
      status: 'available',
    });
    setEditingSeat(null);
  };

  const openEditDialog = (seat: Seat) => {
    setEditingSeat(seat);
    setFormData({
      game_id: seat.game_id,
      section: seat.section,
      row: seat.row,
      number: seat.number.toString(),
      setor_id: seat.setor_id || '',
      status: seat.status,
    });
    setDialogOpen(true);
  };

  const filteredSeats = seats.filter(seat => {
    const matchesSearch = seat.codigo_assento?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         seat.section.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         seat.row.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || seat.status === statusFilter;
    const matchesGame = gameFilter === 'all' || seat.game_id === gameFilter;
    
    return matchesSearch && matchesStatus && matchesGame;
  });

  const getGameName = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.nome_jogo : gameId;
  };

  const getSectorName = (sectorId: string | null) => {
    if (!sectorId) return '-';
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? sector.nome_setor : sectorId;
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
          <h2 className="text-3xl font-bold text-gray-900">💺 Gerenciar Assentos</h2>
          <p className="text-gray-600">Gerencie todos os assentos dos jogos</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-sagrada-green hover:bg-sagrada-green/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Assento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSeat ? 'Editar Assento' : 'Novo Assento'}
              </DialogTitle>
              <DialogDescription>
                {editingSeat 
                  ? 'Edite as informações do assento abaixo.'
                  : 'Preencha as informações para criar um novo assento.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game_id">Jogo</Label>
                <Select value={formData.game_id} onValueChange={(value) => setFormData({...formData, game_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um jogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.nome_jogo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section">Seção</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    placeholder="A"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="row">Fila</Label>
                  <Input
                    id="row"
                    value={formData.row}
                    onChange={(e) => setFormData({...formData, row: e.target.value})}
                    placeholder="1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    type="number"
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    placeholder="15"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="setor_id">Setor</Label>
                <Select value={formData.setor_id} onValueChange={(value) => setFormData({...formData, setor_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.nome_setor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sagrada-green hover:bg-sagrada-green/90">
                  {editingSeat ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Assentos</CardTitle>
              <CardDescription>
                {filteredSeats.length} assento(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar assentos..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-48"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="reserved">Reservado</SelectItem>
                  <SelectItem value="occupied">Ocupado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Jogo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
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
          {filteredSeats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchFilter || statusFilter !== 'all' || gameFilter !== 'all' ? 'Nenhum assento encontrado.' : 'Nenhum assento cadastrado. Clique em "Novo Assento" para começar.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Jogo</TableHead>
                  <TableHead>Seção</TableHead>
                  <TableHead>Fila</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSeats.map((seat) => (
                  <TableRow key={seat.id}>
                    <TableCell className="font-medium">{seat.codigo_assento || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{getGameName(seat.game_id)}</TableCell>
                    <TableCell>{seat.section}</TableCell>
                    <TableCell>{seat.row}</TableCell>
                    <TableCell>{seat.number}</TableCell>
                    <TableCell>{getSectorName(seat.setor_id)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        seat.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : seat.status === 'reserved'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {seat.status === 'available' ? 'Disponível' : 
                         seat.status === 'reserved' ? 'Reservado' : 'Ocupado'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(seat)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(seat.id)}
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

export default SeatsManagement;
