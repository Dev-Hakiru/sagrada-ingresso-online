
import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export type Game = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  category: 'nacional' | 'internacional' | 'amistoso';
  stadium: string;
  price: number;
  image?: string;
};

type GameCardProps = {
  game: Game;
};

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(price);
  };
  
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'nacional': return 'Campeonato Nacional';
      case 'internacional': return 'Torneio Internacional';
      case 'amistoso': return 'Jogo Amistoso';
      default: return category;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute top-2 right-2 bg-sagrada-yellow text-sagrada-gray text-xs font-semibold px-2 py-1 rounded-full z-10">
          {getCategoryLabel(game.category)}
        </div>
        <img 
          src={game.image || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1470"} 
          alt={`${game.homeTeam} vs ${game.awayTeam}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{game.homeTeam} vs {game.awayTeam}</h3>
        
        <div className="flex items-center text-gray-600 mb-1">
          <Calendar size={16} className="mr-1" />
          <span className="text-sm">{formatDate(game.date)} às {game.time}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{game.stadium}</p>
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-sagrada-green">{formatPrice(game.price)}</span>
          <Link to={`/games/${game.id}/seats`}>
            <Button className="btn-primary">Selecionar Assento</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
