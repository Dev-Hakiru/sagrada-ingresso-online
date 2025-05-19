
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import StadiumMap, { SeatType } from '@/components/StadiumMap';
import { getGameById } from '@/data/games';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const SeatSelectionPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]);
  const [game, setGame] = useState(getGameById(Number(gameId)));
  const [seatData, setSeatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  useEffect(() => {
    // Verificar autenticação
    if (!user) {
      navigate('/login', { 
        state: { 
          from: `/games/${gameId}/seats`,
          message: "Você precisa estar logado para selecionar assentos."
        } 
      });
      return;
    }
    
    if (!game) {
      // Game not found, redirect to games list
      navigate('/games');
    }
  }, [game, navigate, user, gameId]);
  
  const fetchSeats = useCallback(async () => {
    if (!gameId) return;
    
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('game_id', gameId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Garantir que apenas assentos marcados como vendidos na base estão indisponíveis
        const updatedData = data.map(seat => ({
          ...seat,
          status: seat.status === 'sold' ? 'sold' : 'available',
          reserved_by: seat.status === 'sold' ? seat.reserved_by : null,
          reserved_until: seat.status === 'sold' ? seat.reserved_until : null,
        }));
        setSeatData(updatedData);
      } else {
        // Se não houver dados, inicializar os assentos no banco de dados
        await initializeSeats();
      }
      
      // Atualizar timestamp da última atualização
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Erro ao buscar assentos:', error);
      uiToast({
        description: "Não foi possível carregar os assentos. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [gameId, uiToast]);
  
  // Atualizar assentos em tempo real - agora a cada 30 segundos
  useEffect(() => {
    // Buscar assentos inicialmente
    fetchSeats();
    
    // Configurar atualização periódica a cada 30 segundos
    const intervalId = setInterval(() => {
      fetchSeats();
    }, 30000); // Atualiza a cada 30 segundos
    
    // Configurar listener para mudanças em tempo real
    const channel = supabase
      .channel('seat-selection-updates')
      .on('postgres_changes', 
        { 
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public', 
          table: 'seats',
          filter: `game_id=eq.${gameId}` 
        }, 
        () => {
          // Quando ocorrer qualquer mudança, recarregar os assentos
          fetchSeats();
        }
      )
      .subscribe();
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      supabase.channel('seat-selection-updates').unsubscribe();
    };
  }, [fetchSeats, gameId]);
  
  const initializeSeats = async () => {
    try {
      // Definir os parâmetros para as áreas VIP e normais
      const vipRows = ['1', '2', '3'];  // 3 fileiras VIP com 28 assentos cada = 84 assentos VIP
      const normalLeftRows = ['1', '2', '3', '4', '5'];  // 5 fileiras na área normal esquerda
      const normalRightRows = ['1', '2', '3', '4', '5'];  // 5 fileiras na área normal direita
      const vipSeatsPerRow = 28;  // 28 assentos por fileira VIP
      const normalSeatsPerRow = 20;  // 20 assentos por fileira normal (20 x 5 x 2 = 200 assentos normais)
      
      // Chamar a função RPC para inicializar os assentos
      const { error } = await supabase.rpc('initialize_seats_for_game', {
        game_id_param: gameId,
        vip_rows: vipRows,
        normal_left_rows: normalLeftRows,
        normal_right_rows: normalRightRows,
        vip_seats_per_row: vipSeatsPerRow,
        normal_seats_per_row: normalSeatsPerRow
      });
      
      if (error) throw error;
      
      // Buscar os assentos novamente após inicialização
      const { data, error: fetchError } = await supabase
        .from('seats')
        .select('*')
        .eq('game_id', gameId);
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Garantir que todos os assentos estão disponíveis 
        const initialSeats = data.map(seat => ({
          ...seat,
          status: 'available',
          reserved_by: null,
          reserved_until: null,
        }));
        setSeatData(initialSeats);
      }
    } catch (error) {
      console.error('Erro ao inicializar assentos:', error);
      toast("Erro", {
        description: "Não foi possível inicializar os assentos. Tente novamente mais tarde.",
      });
    }
  };
  
  const handleManualRefresh = () => {
    fetchSeats();
  };
  
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
      setSelectedSeats(prev => [...prev, seat]);
    } else {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    }
  };
  
  const handleAddToCart = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Por favor, selecione pelo menos um assento.");
      return;
    }
    
    try {
      addToCart({
        gameId: game.id,
        gameTitle: `${game.homeTeam} vs ${game.awayTeam}`,
        date: game.date,
        time: game.time,
        seats: selectedSeats
      });
      
      toast.success("Assentos adicionados ao carrinho com sucesso!");
      navigate('/cart');
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast.error("Erro ao adicionar assentos ao carrinho. Tente novamente.");
    }
  };

  // Calcular tempo desde a última atualização
  const getTimeSinceLastRefresh = () => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - lastRefreshTime.getTime()) / 1000);
    return seconds;
  };

  // Calcular porcentagem para a barra de progresso da próxima atualização
  const getRefreshProgress = () => {
    const secondsSinceRefresh = getTimeSinceLastRefresh();
    const progressPercentage = Math.min(100, (secondsSinceRefresh / 30) * 100);
    return progressPercentage;
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
          
          {/* Barra de atualização */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">
                {refreshing 
                  ? "Atualizando assentos..." 
                  : `Última atualização: ${lastRefreshTime.toLocaleTimeString()}`}
              </span>
              <button 
                onClick={handleManualRefresh}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={refreshing}
              >
                Atualizar agora
              </button>
            </div>
            <Progress value={getRefreshProgress()} className="h-1" />
            <p className="text-xs text-gray-500 mt-1">Próxima atualização em {30 - getTimeSinceLastRefresh()} segundos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Selecione seus assentos</h2>
              {loading ? (
                <div className="flex flex-col space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <div className="flex justify-center">
                    <p>Carregando assentos...</p>
                  </div>
                </div>
              ) : refreshing ? (
                <div className="relative">
                  <StadiumMap 
                    selectedSeats={selectedSeats} 
                    onSeatSelect={handleSeatSelect} 
                    gameId={game.id}
                    seatData={seatData}
                  />
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-medium text-gray-800">Atualizando assentos...</p>
                      <p className="text-sm text-gray-500">Por favor, aguarde</p>
                    </div>
                  </div>
                </div>
              ) : (
                <StadiumMap 
                  selectedSeats={selectedSeats} 
                  onSeatSelect={handleSeatSelect} 
                  gameId={game.id}
                  seatData={seatData}
                />
              )}
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
