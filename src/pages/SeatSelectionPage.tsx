
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import StadiumMap, { SeatType } from '@/components/StadiumMap';
import { getGameById } from '@/data/games';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Calendar } from 'lucide-react';

const SeatSelectionPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]);
  const [game, setGame] = useState(getGameById(Number(gameId)));
  
  useEffect(() => {
    if (!game) {
      // Game not found, redirect to games list
      navigate('/games');
    }
  }, [game, navigate]);
  
  if (!game) {
    return null;
  }
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(price);
  };
  
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  
  const handleSeatSelect = (seat: SeatType) => {
    if (seat.status === 'selected') {
      setSelectedSeats([...selectedSeats, seat]);
    } else {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    }
  };
  
  const handleAddToCart = () => {
    if (selectedSeats.length > 0) {
      addToCart({
        gameId: game.id,
        gameTitle: `${game.homeTeam} vs ${game.awayTeam}`,
        date: game.date,
        time: game.time,
        seats: selectedSeats
      });
      
      navigate('/cart');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{game.homeTeam} vs {game.awayTeam}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <Calendar size={18} className="mr-2" />
            <span>{formatDate(game.date)} às {game.time}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Selecione seus assentos</h2>
              <StadiumMap selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect} />
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Resumo da seleção</h2>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">{game.homeTeam} vs {game.awayTeam}</h3>
                <p className="text-gray-600 text-sm">{formatDate(game.date)} às {game.time}</p>
                <p className="text-gray-600 text-sm">{game.stadium}</p>
              </div>
              
              <div className="border-t border-gray-200 my-4 pt-4">
                <h3 className="font-medium mb-2">Assentos selecionados</h3>
                
                {selectedSeats.length === 0 ? (
                  <p className="text-gray-500 italic">Nenhum assento selecionado</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="flex justify-between">
                        <span>{seat.section} - Fila {seat.row}, Assento {seat.number}</span>
                        <span className="font-medium">{formatPrice(seat.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-sagrada-green hover:bg-sagrada-green/90"
                  disabled={selectedSeats.length === 0}
                  onClick={handleAddToCart}
                >
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SeatSelectionPage;
