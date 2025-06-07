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
  soldSeats?: Set<string>;
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

const StadiumMap = ({ gameId, selectedSeats, onSeatSelect, seatData = [], soldSeats = new Set() }: StadiumMapProps) => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const [seats, setSeats] = useState<Record<string, Record<string, SeatType[]>>>({});
  const [realtimeSeats, setRealtimeSeats] = useState<Record<string, any>>({});
  
  // Organizar os assentos por seção e fila
  const organizeSeats = useCallback((seatsData: any[]) => {
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
      
      // Verificar se este assento foi vendido (baseado na tabela tickets)
      const isSold = soldSeats.has(dbSeat.id);
      
      // Determinar o status final do assento
      let finalStatus: 'available' | 'reserved' | 'sold' | 'selected';
      if (isSold) {
        finalStatus = 'sold';
      } else if (isSelected) {
        finalStatus = 'selected';
      } else {
        finalStatus = 'available';
      }
      
      // Criar o objeto de assento
      const seat: SeatType = {
        id: dbSeat.id,
        section: dbSeat.section,
        row: dbSeat.row,
        number: dbSeat.number,
        status: finalStatus,
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
  }, [realtimeSeats, selectedSeats, soldSeats]);
  
  // Configurar inscrição em tempo real para os assentos
  useEffect(() => {
    // Se não temos dados de assentos, não precisamos configurar a inscrição
    if (seatData && seatData.length > 0) {
      organizeSeats(seatData);
    }

    // Configurar inscrição em tempo real para os assentos
    const channel = supabase
      .channel('seat-updates')
      .on('postgres_changes', 
        { 
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public', 
          table: 'seats',
          filter: `game_id=eq.${gameId.toString()}` // Convert number to string here 
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
      
    // Limpar inscrição ao desmontar
    return () => {
      supabase.channel('seat-updates').unsubscribe();
    };
  }, [seatData, gameId, organizeSeats]);
  
  // Atualizar assentos quando os dados mudarem
  useEffect(() => {
    if (seatData && seatData.length > 0) {
      organizeSeats(seatData);
    }
  }, [seatData, organizeSeats, selectedSeats, realtimeSeats, soldSeats]);

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
                      disabled={seat.status === 'sold'}
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

      {Object.keys(seats).length === 0 && (
        <div className="text-center py-8">
          <p>Nenhum assento disponível para este jogo.</p>
        </div>
      )}
    </div>
  );
};

export default StadiumMap;
