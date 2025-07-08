
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface Sector {
  id: string;
  nome_setor: string;
  capacidade: number;
  preco: number;
  status: string;
  created_at: string;
}

const SectorsManagement = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [formData, setFormData] = useState({
    nome_setor: '',
    capacidade: '',
    preco: '',
    status: 'ativo',
  });

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('nome_setor', { ascending: true });

      if (error) throw error;
      setSectors(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar setores:', error);
      toast.error('Erro ao carregar setores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sectorData = {
        nome_setor: formData.nome_setor,
        capacidade: parseInt(formData.capacidade),
        preco: parseFloat(formData.preco),
        status: formData.status,
      };

      if (editingSector) {
        const { error } = await supabase
          .from('sectors')
          .update(sectorData)
          .eq('id', editingSector.id);

        if (error) throw error;
        toast.success('Setor atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('sectors')
          .insert([sectorData]);

        if (error) throw error;
        toast.success('Setor criado com sucesso!');
      }

      fetchSectors();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar setor:', error);
      toast.error('Erro ao salvar setor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este setor?')) return;

    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Setor excluído com sucesso!');
      fetchSectors();
    } catch (error: any) {
      console.error('Erro ao excluir setor:', error);
      toast.error('Erro ao excluir setor');
    }
  };

  const resetForm = () => {
    setFormData({
      nome_setor: '',
      capacidade: '',
      preco: '',
      status: 'ativo',
    });
    setEditingSector(null);
  };

  const openEditDialog = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      nome_setor: sector.nome_setor,
      capacidade: sector.capacidade.toString(),
      preco: sector.preco.toString(),
      status: sector.status,
    });
    setDialogOpen(true);
  };

  const filteredSectors = sectors.filter(sector =>
    sector.nome_setor.toLowerCase().includes(searchFilter.toLowerCase())
  );

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
          <h2 className="text-3xl font-bold text-gray-900">🏟️ Gerenciar Setores</h2>
          <p className="text-gray-600">Gerencie todos os setores do estádio</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-sagrada-green hover:bg-sagrada-green/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Setor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSector ? 'Editar Setor' : 'Novo Setor'}
              </DialogTitle>
              <DialogDescription>
                {editingSector 
                  ? 'Edite as informações do setor abaixo.'
                  : 'Preencha as informações para criar um novo setor.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_setor">Nome do Setor</Label>
                <Input
                  id="nome_setor"
                  value={formData.nome_setor}
                  onChange={(e) => setFormData({...formData, nome_setor: e.target.value})}
                  placeholder="Ex: VIP, Geral, Arquibancada"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade</Label>
                <Input
                  id="capacidade"
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                  placeholder="Ex: 500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (AOA)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({...formData, preco: e.target.value})}
                  placeholder="Ex: 1500.00"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sagrada-green hover:bg-sagrada-green/90">
                  {editingSector ? 'Atualizar' : 'Criar'}
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
              <CardTitle>Lista de Setores</CardTitle>
              <CardDescription>
                {filteredSectors.length} setor(es) encontrado(s)
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar setores..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSectors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchFilter ? 'Nenhum setor encontrado.' : 'Nenhum setor cadastrado. Clique em "Novo Setor" para começar.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Setor</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Preço (AOA)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSectors.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell className="font-medium">{sector.nome_setor}</TableCell>
                    <TableCell>{sector.capacidade}</TableCell>
                    <TableCell>{sector.preco.toLocaleString('pt-AO')} AOA</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sector.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sector.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(sector)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(sector.id)}
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

export default SectorsManagement;
