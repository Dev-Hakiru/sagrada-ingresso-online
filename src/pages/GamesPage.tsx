
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import GameCard, { Game } from '@/components/GameCard';
import { gamesData } from '@/data/games';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FilterState = {
  month: string;
  category: string;
};

const GamesPage = () => {
  const [filters, setFilters] = useState<FilterState>({
    month: 'all',
    category: 'all'
  });

  const months = [
    { value: 'all', label: 'Todos os Meses' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
  ];

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'nacional', label: 'Campeonato Nacional' },
    { value: 'internacional', label: 'Torneio Internacional' },
    { value: 'amistoso', label: 'Jogo Amistoso' },
  ];

  const filteredGames = gamesData.filter(game => {
    // Filter by month
    const gameMonth = new Date(game.date).getMonth() + 1;
    const monthMatch = filters.month === 'all' || gameMonth.toString() === filters.month;
    
    // Filter by category
    const categoryMatch = filters.category === 'all' || game.category === filters.category;
    
    return monthMatch && categoryMatch;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-sagrada-gray">Jogos e Eventos</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
              <Select value={filters.month} onValueChange={(value) => setFilters({...filters, month: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600">Nenhum jogo encontrado com os filtros selecionados.</h3>
              <p className="mt-2 text-gray-500">Experimente outros filtros para encontrar jogos disponíveis.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GamesPage;
