
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Game {
  id: string;
  nome_jogo: string;
  data: string;
  hora: string;
  descricao?: string;
  imagem_url?: string;
  created_at: string;
}

const GamesManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    nome_jogo: '',
    data: '',
    hora: '',
    descricao: '',
    imagem_url: '',
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('data', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar jogos:', error);
      toast.error('Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGame) {
        const { error } = await supabase
          .from('games')
          .update(formData)
          .eq('id', editingGame.id);

        if (error) throw error;
        toast.success('Jogo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('games')
          .insert([formData]);

        if (error) throw error;
        toast.success('Jogo criado com sucesso!');
      }

      fetchGames();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar jogo:', error);
      toast.error('Erro ao salvar jogo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Jogo excluído com sucesso!');
      fetchGames();
    } catch (error: any) {
      console.error('Erro ao excluir jogo:', error);
      toast.error('Erro ao excluir jogo');
    }
  };

  const resetForm = () => {
    setFormData({
      nome_jogo: '',
      data: '',
      hora: '',
      descricao: '',
      imagem_url: '',
    });
    setEditingGame(null);
  };

  const openEditDialog = (game: Game) => {
    setEditingGame(game);
    setFormData({
      nome_jogo: game.nome_jogo,
      data: game.data,
      hora: game.hora,
      descricao: game.descricao || '',
      imagem_url: game.imagem_url || '',
    });
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
          <h2 className="text-3xl font-bold text-gray-900">Gestão de Jogos</h2>
          <p className="text-gray-600">Gerencie todos os jogos do estádio</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-sagrada-green hover:bg-sagrada-green/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Jogo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingGame ? 'Editar Jogo' : 'Novo Jogo'}
              </DialogTitle>
              <DialogDescription>
                {editingGame 
                  ? 'Edite as informações do jogo abaixo.'
                  : 'Preencha as informações para criar um novo jogo.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_jogo">Nome do Jogo</Label>
                <Input
                  id="nome_jogo"
                  value={formData.nome_jogo}
                  onChange={(e) => setFormData({...formData, nome_jogo: e.target.value})}
                  placeholder="Ex: Sagrada Esperança vs Petro de Luanda"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição opcional do jogo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imagem_url">URL da Imagem</Label>
                <Input
                  id="imagem_url"
                  value={formData.imagem_url}
                  onChange={(e) => setFormData({...formData, imagem_url: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sagrada-green hover:bg-sagrada-green/90">
                  {editingGame ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Jogos</CardTitle>
          <CardDescription>
            {games.length} jogo(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum jogo cadastrado. Clique em "Novo Jogo" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Jogo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell className="font-medium">{game.nome_jogo}</TableCell>
                    <TableCell>{formatDate(game.data)}</TableCell>
                    <TableCell>{game.hora}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {game.descricao || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(game)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(game.id)}
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

export default GamesManagement;
