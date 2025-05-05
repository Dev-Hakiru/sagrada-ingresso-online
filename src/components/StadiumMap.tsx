
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

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
  const { toast } = useToast();
  const [seats, setSeats] = useState<Record<string, Record<string, SeatType[]>>>({});
  const [loading, setLoading] = useState(false);
  const [realtimeSeats, setRealtimeSeats] = useState<Record<string, any>>({});
  
  useEffect(() => {
    setupRealtimeSubscription();
    organizeSeats();
    
    // Cleanup subscription on unmount
    return () => {
      cleanupRealtimeSubscription();
    };
  }, [seatData]);
  
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('seat-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'seats',
          filter: `game_id=eq.${gameId}` 
        }, 
        (payload) => {
          // Update our local state when we get realtime updates
          setRealtimeSeats(prevSeats => ({
            ...prevSeats,
            [payload.new.id]: payload.new
          }));
        }
      )
      .subscribe();
      
    return channel;
  };
  
  const cleanupRealtimeSubscription = () => {
    supabase.channel('seat-updates').unsubscribe();
  };
  
  const organizeSeats = () => {
    if (!seatData || seatData.length === 0) return;
    
    const organizedSeats: Record<string, Record<string, SeatType[]>> = {};
    
    seatData.forEach(dbSeat => {
      if (!dbSeat) return;
      
      const section = dbSeat.section || '';
      const row = dbSeat.row || '';
      
      // Initialize section if doesn't exist
      if (!organizedSeats[section]) {
        organizedSeats[section] = {};
      }
      
      // Initialize row if doesn't exist
      if (!organizedSeats[section][row]) {
        organizedSeats[section][row] = [];
      }
      
      // Check if this seat is being tracked in realtime updates
      const realtimeSeat = realtimeSeats[dbSeat.id];
      const currentStatus = realtimeSeat ? realtimeSeat.status : dbSeat.status;
      
      // Check if this seat is selected
      const isSelected = selectedSeats.some(selectedSeat => 
        selectedSeat.id === dbSeat.id
      );
      
      // Create the seat object
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
    
    // Sort rows and seats by number
    Object.keys(organizedSeats).forEach(section => {
      Object.keys(organizedSeats[section]).forEach(row => {
        organizedSeats[section][row].sort((a, b) => a.number - b.number);
      });
    });
    
    setSeats(organizedSeats);
  };
  
  useEffect(() => {
    // Update seats organization when selectedSeats change
    organizeSeats();
  }, [selectedSeats, realtimeSeats, seatData]);
  
  const handleSeatClick = async (seat: SeatType) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para selecionar assentos",
        variant: "destructive"
      });
      return;
    }
    
    if (seat.status === 'sold') {
      toast({
        title: "Assento indisponível",
        description: "Este assento já foi vendido",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // If the seat is already selected, we want to deselect it
      if (seat.status === 'selected') {
        // Update the seat status to available in the database
        const { error } = await supabase
          .from('seats')
          .update({ 
            status: 'available',
            reserved_by: null,
            reserved_until: null
          })
          .eq('id', seat.id);
          
        if (error) throw error;
        
        // Update the UI - this will remove the seat from selection
        seat.status = 'available';
      } 
      // If the seat is available, we want to select it
      else if (seat.status === 'available') {
        // Calculate reservation time (15 minutes from now)
        const reservationTime = new Date();
        reservationTime.setMinutes(reservationTime.getMinutes() + 15);
        
        // Update the seat status to selected in the database
        const { error } = await supabase
          .from('seats')
          .update({ 
            status: 'selected',
            reserved_by: user.id,
            reserved_until: reservationTime.toISOString()
          })
          .eq('id', seat.id);
          
        if (error) throw error;
        
        // Update the UI - this will add the seat to selection
        seat.status = 'selected';
      }
      
      // Call the parent component's function to update selected seats
      onSeatSelect(seat);
    } catch (error: any) {
      console.error('Error updating seat status:', error);
      toast({
        title: "Erro",
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
