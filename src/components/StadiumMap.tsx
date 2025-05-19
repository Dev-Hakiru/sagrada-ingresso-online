
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type SeatType = {
  id: string;
  section: string;
  row: string;
  number: number;
  status: 'available' | 'reserved' | 'sold' | 'selected';
  price: number;
};

type StadiumMapProps = {
  gameId: number;
  selectedSeats: SeatType[];
  onSeatSelect: (seat: SeatType) => void;
  seatData?: any[];
};

const SEAT_COLORS = {
  available: 'bg-green-500',
  reserved: 'bg-yellow-500',
  sold: 'bg-red-500',
  selected: 'bg-blue-500'
};

// Preços atualizados para as diferentes seções
const SEAT_PRICES = {
  A: 1500, // VIP
  B: 500,  // Normal Esquerda
  C: 500   // Normal Direita
};

const StadiumMap = ({ gameId, selectedSeats, onSeatSelect, seatData = [] }: StadiumMapProps) => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const [seats, setSeats] = useState<Record<string, Record<string, SeatType[]>>>({});
  const [loading, setLoading] = useState(false);
  const [realtimeSeats, setRealtimeSeats] = useState<Record<string, any>>({});
  
  // Função para buscar os dados dos assentos
  const fetchSeats = useCallback(async () => {
    if (!gameId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('game_id', gameId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Garantir que todos os assentos estão disponíveis a menos que estejam vendidos
        const updatedData = data.map(seat => ({
          ...seat,
          status: seat.status === 'sold' ? 'sold' : 'available',
          reserved_by: seat.status === 'sold' ? seat.reserved_by : null,
          reserved_until: seat.status === 'sold' ? seat.reserved_until : null,
        }));
        
        // Atualizar os dados dos assentos
        organizeSeats(updatedData);
      } else {
        // Se não houver dados, inicializar os assentos no banco de dados
        await initializeSeats();
      }
    } catch (error) {
      console.error('Erro ao buscar assentos:', error);
      uiToast({
        description: "Não foi possível carregar os assentos. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [gameId, uiToast]);
  
  // Atualizar assentos em tempo real
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchSeats();
    }, 5000); // Atualiza a cada 5 segundos
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchSeats]);
  
  // Configurar inscrição em tempo real para os assentos
  useEffect(() => {
    setupRealtimeSubscription();
    
    // Buscar os assentos no carregamento inicial
    fetchSeats();
    
    // Limpar inscrição ao desmontar
    return () => {
      cleanupRealtimeSubscription();
    };
  }, [fetchSeats]);
  
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('seat-updates')
      .on('postgres_changes', 
        { 
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public', 
          table: 'seats',
          filter: `game_id=eq.${gameId}` 
        }, 
        (payload) => {
          // Atualizar nosso estado local quando recebemos atualizações em tempo real
          if (payload.eventType === 'DELETE') {
            // Se um assento foi excluído, removê-lo do estado
            setRealtimeSeats(prevSeats => {
              const newSeats = { ...prevSeats };
              delete newSeats[payload.old.id];
              return newSeats;
            });
            
            // Refetch para garantir que tenhamos os dados mais recentes
            fetchSeats();
            
            toast.info("Um assento foi removido e está agora disponível");
          } else {
            // Para INSERT e UPDATE, atualizar o assento no estado
            setRealtimeSeats(prevSeats => ({
              ...prevSeats,
              [payload.new.id]: payload.new
            }));
          }
        }
      )
      .subscribe();
      
    return channel;
  };
  
  const cleanupRealtimeSubscription = () => {
    supabase.channel('seat-updates').unsubscribe();
  };
  
  const organizeSeats = (seatsData: any[]) => {
    if (!seatsData || seatsData.length === 0) return;
    
    const organizedSeats: Record<string, Record<string, SeatType[]>> = {};
    
    seatsData.forEach(dbSeat => {
      if (!dbSeat) return;
      
      const section = dbSeat.section || '';
      const row = dbSeat.row || '';
      
      // Inicializar seção se não existir
      if (!organizedSeats[section]) {
        organizedSeats[section] = {};
      }
      
      // Inicializar linha se não existir
      if (!organizedSeats[section][row]) {
        organizedSeats[section][row] = [];
      }
      
      // Verificar se este assento está sendo rastreado em atualizações em tempo real
      const realtimeSeat = realtimeSeats[dbSeat.id];
      const currentStatus = realtimeSeat ? realtimeSeat.status : dbSeat.status;
      
      // Verificar se este assento está selecionado
      const isSelected = selectedSeats.some(selectedSeat => 
        selectedSeat.id === dbSeat.id
      );
      
      // Criar o objeto de assento
      const seat: SeatType = {
        id: dbSeat.id,
        section: dbSeat.section,
        row: dbSeat.row,
        number: dbSeat.number,
        status: isSelected ? 'selected' : (currentStatus === 'sold' ? 'sold' : 'available'),
        price: SEAT_PRICES[dbSeat.section as keyof typeof SEAT_PRICES] || 5000
      };
      
      organizedSeats[section][row].push(seat);
    });
    
    // Ordenar linhas e assentos por número
    Object.keys(organizedSeats).forEach(section => {
      Object.keys(organizedSeats[section]).forEach(row => {
        organizedSeats[section][row].sort((a, b) => a.number - b.number);
      });
    });
    
    setSeats(organizedSeats);
  };
  
  useEffect(() => {
    // Atualizar organização dos assentos quando selectedSeats mudar
    if (seatData && seatData.length > 0) {
      organizeSeats(seatData);
    }
  }, [selectedSeats, realtimeSeats, seatData]);
  
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
        game_id_param: gameId.toString(),
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
        .eq('game_id', gameId.toString());
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Garantir que todos os assentos estão disponíveis
        const initialSeats = data.map(seat => ({
          ...seat,
          status: 'available',
          reserved_by: null,
          reserved_until: null,
        }));
        organizeSeats(initialSeats);
      }
    } catch (error) {
      console.error('Erro ao inicializar assentos:', error);
      toast("Erro", {
        description: "Não foi possível inicializar os assentos. Tente novamente mais tarde.",
      });
    }
  };
  
  const handleSeatClick = async (seat: SeatType) => {
    if (!user) {
      uiToast({
        description: "Você precisa estar logado para selecionar assentos",
        variant: "destructive"
      });
      return;
    }
    
    if (seat.status === 'sold') {
      uiToast({
        description: "Este assento já foi vendido",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Se o assento já está selecionado, queremos desmarcar
      if (seat.status === 'selected') {
        // Atualizar o status do assento para disponível no banco de dados
        const { error } = await supabase
          .from('seats')
          .update({ 
            status: 'available',
            reserved_by: null,
            reserved_until: null
          })
          .eq('id', seat.id);
          
        if (error) throw error;
        
        // Atualizar a UI - isso removerá o assento da seleção
        seat.status = 'available';
      } 
      // Se o assento está disponível, queremos selecioná-lo
      else if (seat.status === 'available') {
        // Calcular tempo de reserva (15 minutos a partir de agora)
        const reservationTime = new Date();
        reservationTime.setMinutes(reservationTime.getMinutes() + 15);
        
        // Atualizar o status do assento para selecionado no banco de dados
        const { error } = await supabase
          .from('seats')
          .update({ 
            status: 'selected',
            reserved_by: user.id,
            reserved_until: reservationTime.toISOString()
          })
          .eq('id', seat.id);
          
        if (error) throw error;
        
        // Atualizar a UI - isso adicionará o assento à seleção
        seat.status = 'selected';
      }
      
      // Chamar a função do componente pai para atualizar assentos selecionados
      onSeatSelect(seat);
    } catch (error: any) {
      console.error('Error updating seat status:', error);
      uiToast({
        description: error.message || "Ocorreu um erro ao selecionar o assento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stadium-map">
      <div className="mb-6 text-center">
        <div className="flex justify-center space-x-4 mb-2">
          <div className="flex items-center">
            <div className={`w-4 h-4 ${SEAT_COLORS.available} rounded-sm mr-1`}></div>
            <span className="text-sm">Disponível</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 ${SEAT_COLORS.selected} rounded-sm mr-1`}></div>
            <span className="text-sm">Selecionado</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 ${SEAT_COLORS.sold} rounded-sm mr-1`}></div>
            <span className="text-sm">Vendido</span>
          </div>
        </div>
        <div className="w-full h-4 bg-gray-300 mb-8 relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold bg-white px-2 rounded">
            PALCO
          </div>
        </div>
      </div>

      {Object.keys(seats).sort().map(section => (
        <div key={section} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Seção {section} - {
            section === 'A' ? 'VIP (1.500 AOA)' : 
            section === 'B' ? 'Normal Esquerda (500 AOA)' : 
            'Normal Direita (500 AOA)'
          }</h3>
          <div className="grid gap-4">
            {Object.keys(seats[section]).sort().map(row => (
              <div key={`${section}-${row}`} className="flex items-center gap-2">
                <div className="w-10 text-right font-medium">
                  Fila {row}
                </div>
                <div className="flex-1 flex flex-wrap gap-1 justify-center">
                  {seats[section][row].map(seat => (
                    <button
                      key={seat.id}
                      disabled={loading || seat.status === 'sold'}
                      className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs text-white ${SEAT_COLORS[seat.status]} hover:opacity-80 transition-opacity disabled:cursor-not-allowed`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
                <div className="w-10 text-left font-medium">
                  Fila {row}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(seats).length === 0 && !loading && (
        <div className="text-center py-8">
          <p>Nenhum assento disponível para este jogo.</p>
        </div>
      )}
    </div>
  );
};

export default StadiumMap;
