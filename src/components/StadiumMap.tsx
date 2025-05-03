
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type SeatType = {
  id: string;
  row: string;
  number: number;
  section: string;
  status: 'available' | 'selected' | 'unavailable';
  price: number;
};

type StadiumMapProps = {
  selectedSeats: SeatType[];
  onSeatSelect: (seat: SeatType) => void;
  gameId?: string | number;
};

const StadiumMap: React.FC<StadiumMapProps> = ({ selectedSeats, onSeatSelect, gameId }) => {
  const { user } = useAuth();
  const [seats, setSeats] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Gerar preços base por seção
  const getPriceBySection = (section: string): number => {
    switch(section) {
      case 'VIP':
        return 10000;
      case 'Lateral-Esquerda':
      case 'Lateral-Direita':
        return 5000;
      default:
        return 3000;
    }
  };

  // Inicializar assentos no banco de dados se for um jogo real
  useEffect(() => {
    const initializeSeatsInDb = async () => {
      if (!gameId) return;
      
      try {
        // Inicializar assentos para VIP
        await supabase.rpc('initialize_seats_for_game', {
          game_id_param: gameId.toString(),
          sections: ['VIP'],
          rows_param: ['A', 'B', 'C', 'D', 'E'],
          seats_per_row: 20
        });

        // Inicializar assentos para Lateral-Esquerda
        await supabase.rpc('initialize_seats_for_game', {
          game_id_param: gameId.toString(),
          sections: ['Lateral-Esquerda'],
          rows_param: ['F', 'G', 'H', 'I', 'J'],
          seats_per_row: 25
        });

        // Inicializar assentos para Lateral-Direita
        await supabase.rpc('initialize_seats_for_game', {
          game_id_param: gameId.toString(),
          sections: ['Lateral-Direita'],
          rows_param: ['F', 'G', 'H', 'I', 'J'],
          seats_per_row: 25
        });
        
        console.log('Seats initialized in database');
      } catch (error) {
        console.error('Error initializing seats:', error);
      }
    };

    initializeSeatsInDb();
  }, [gameId]);

  // Buscar assentos do banco de dados ou gerar localmente
  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true);
      
      if (gameId) {
        try {
          const { data, error } = await supabase
            .from('seats')
            .select('*')
            .eq('game_id', gameId.toString());
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Transformar dados do banco para o formato SeatType
            const dbSeats: SeatType[] = data.map(dbSeat => {
              // Calcular preço baseado na seção e fila
              const basePrice = getPriceBySection(dbSeat.section);
              // Ajuste de preço por fila (filas mais à frente são mais caras)
              const rowIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].indexOf(dbSeat.row);
              const priceAdjustment = dbSeat.section === 'VIP' ? rowIndex * 200 : rowIndex * 100;
              
              return {
                id: dbSeat.id,
                row: dbSeat.row,
                number: dbSeat.number,
                section: dbSeat.section,
                // Mapeamento de status do banco para o tipo local
                status: dbSeat.status === 'available' ? 'available' : 
                       (dbSeat.status === 'reserved' || dbSeat.status === 'sold') ? 'unavailable' : 'available',
                price: basePrice - priceAdjustment
              };
            });
            
            setSeats(dbSeats);
            console.log('Loaded seats from database:', dbSeats.length);
          } else {
            generateLocalSeats();
          }
        } catch (error) {
          console.error('Erro ao buscar assentos:', error);
          generateLocalSeats();
        }
      } else {
        generateLocalSeats();
      }
      
      setLoading(false);
    };
    
    fetchSeats();
    
    // Configurar escuta de tempo real para atualizações de assentos
    if (gameId) {
      const channel = supabase
        .channel('seats-changes')
        .on('postgres_changes', 
          {
            event: '*', 
            schema: 'public',
            table: 'seats',
            filter: `game_id=eq.${gameId}`
          }, 
          (payload) => {
            console.log('Seat change detected:', payload);
            // Atualizar o assento individual que mudou
            setSeats(currentSeats => {
              return currentSeats.map(seat => {
                if (seat.id === payload.new.id) {
                  return {
                    ...seat,
                    status: payload.new.status === 'available' ? 'available' : 'unavailable'
                  };
                }
                return seat;
              });
            });
          }
        )
        .subscribe();
      
      // Limpar canal ao desmontar
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [gameId]);
  
  // Função para gerar assentos localmente quando não temos um gameId real
  const generateLocalSeats = () => {
    const generateSeats = (section: string, rows: string[], seatsPerRow: number, startPrice: number): SeatType[] => {
      const seats: SeatType[] = [];
      rows.forEach((row, rowIndex) => {
        for (let i = 1; i <= seatsPerRow; i++) {
          // Vary prices slightly based on row
          const priceAdjustment = section === 'VIP' ? rowIndex * 200 : rowIndex * 100;
          
          seats.push({
            id: `${section}-${row}-${i}`,
            row,
            number: i,
            section,
            status: 'available' as const,
            price: startPrice - priceAdjustment
          });
        }
      });
      return seats;
    };
    
    // Generate seat data
    const vipSeats = generateSeats('VIP', ['A', 'B', 'C', 'D', 'E'], 20, 10000);
    const lateralLeftSeats = generateSeats('Lateral-Esquerda', ['F', 'G', 'H', 'I', 'J'], 25, 5000);
    const lateralRightSeats = generateSeats('Lateral-Direita', ['F', 'G', 'H', 'I', 'J'], 25, 5000);
    
    setSeats([
      ...vipSeats, 
      ...lateralLeftSeats, 
      ...lateralRightSeats
    ]);
    
    console.log('Generated local seats');
  };

  // Manipular cliques em assentos para seleção/deseleção
  const handleSeatClick = async (seat: SeatType) => {
    // Se não estamos usando um gameId real, apenas gerenciar estado local
    if (!gameId) {
      const updatedSeats = seats.map((s) => {
        if (s.id === seat.id) {
          const newStatus: 'available' | 'selected' = s.status === 'selected' ? 'available' : 'selected';
          const updatedSeat = { ...s, status: newStatus };
          onSeatSelect(updatedSeat);
          return updatedSeat;
        }
        return s;
      });
      
      setSeats(updatedSeats);
      return;
    }
    
    // Com gameId real, precisamos verificar e atualizar no banco de dados
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        toast.error('Você precisa estar logado para selecionar assentos');
        return;
      }
      
      // Se o assento estava selecionado, liberar no banco
      if (seat.status === 'selected') {
        // Primeiro, atualizar o estado localmente
        setSeats(prevSeats => prevSeats.map(s => 
          s.id === seat.id ? {...s, status: 'available'} : s
        ));
        
        // Remover o assento selecionado
        onSeatSelect({...seat, status: 'available'});
        
        // Atualizar no banco de dados
        const { error } = await supabase
          .from('seats')
          .update({ 
            status: 'available',
            reserved_by: null,
            reserved_until: null
          })
          .eq('id', seat.id);
        
        if (error) {
          console.error('Error releasing seat:', error);
          toast.error('Erro ao liberar assento');
          return;
        }
      } else if (seat.status === 'available') {
        // Se o assento está disponível, reservar para o usuário
        
        // Primeiro, atualizar o estado localmente para feedback imediato
        setSeats(prevSeats => prevSeats.map(s => 
          s.id === seat.id ? {...s, status: 'selected'} : s
        ));
        
        // Adicionar o assento selecionado
        onSeatSelect({...seat, status: 'selected'});
        
        // Atualizar no banco de dados - reservar por 15 minutos
        const reservationExpiry = new Date();
        reservationExpiry.setMinutes(reservationExpiry.getMinutes() + 15);
        
        const { error } = await supabase
          .from('seats')
          .update({ 
            status: 'reserved',
            reserved_by: user.id,
            reserved_until: reservationExpiry.toISOString()
          })
          .eq('id', seat.id);
        
        if (error) {
          console.error('Error reserving seat:', error);
          toast.error('Erro ao reservar assento');
          
          // Reverter a mudança local em caso de erro
          setSeats(prevSeats => prevSeats.map(s => 
            s.id === seat.id ? {...s, status: 'available'} : s
          ));
          
          // Remover da seleção
          onSeatSelect({...seat, status: 'available'});
          return;
        }
      }
      // Assentos indisponíveis não podem ser clicados
    } catch (error) {
      console.error('Error updating seat:', error);
      toast.error('Erro ao atualizar assento');
    }
  };
  
  const handleZoomIn = () => {
    if (zoomLevel < 2) {
      setZoomLevel(zoomLevel + 0.2);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 0.6) {
      setZoomLevel(zoomLevel - 0.2);
    }
  };
  
  const filterSeatsBySection = (section: string | null) => {
    if (!section) return seats;
    return seats.filter(seat => seat.section === section);
  };
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sagrada-green"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button 
          onClick={() => setActiveSection(null)} 
          variant={activeSection === null ? "default" : "outline"}
          className={activeSection === null ? "bg-sagrada-green" : ""}
        >
          Todos
        </Button>
        <Button 
          onClick={() => setActiveSection('VIP')} 
          variant={activeSection === 'VIP' ? "default" : "outline"}
          className={activeSection === 'VIP' ? "bg-sagrada-green" : ""}
        >
          VIP ({formatPrice(10000)})
        </Button>
        <Button 
          onClick={() => setActiveSection('Lateral-Esquerda')} 
          variant={activeSection === 'Lateral-Esquerda' ? "default" : "outline"}
          className={activeSection === 'Lateral-Esquerda' ? "bg-sagrada-green" : ""}
        >
          Lateral Esquerda ({formatPrice(5000)})
        </Button>
        <Button 
          onClick={() => setActiveSection('Lateral-Direita')} 
          variant={activeSection === 'Lateral-Direita' ? "default" : "outline"}
          className={activeSection === 'Lateral-Direita' ? "bg-sagrada-green" : ""}
        >
          Lateral Direita ({formatPrice(5000)})
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-sagrada-green rounded-sm mr-2"></div>
            <span className="text-sm">Disponível</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-sagrada-yellow rounded-sm mr-2"></div>
            <span className="text-sm">Selecionado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded-sm mr-2"></div>
            <span className="text-sm">Indisponível</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleZoomOut} variant="outline" size="sm">-</Button>
          <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
          <Button onClick={handleZoomIn} variant="outline" size="sm">+</Button>
        </div>
      </div>
      
      <div className="stadium-container border rounded-md">
        <div 
          className="relative min-w-[800px] bg-gray-100 p-6 rounded-md"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
        >
          {/* Field */}
          <div className="w-3/4 h-40 bg-sagrada-green mx-auto rounded-md mb-4 flex items-center justify-center">
            <p className="text-white font-bold">Campo</p>
          </div>
          
          {/* VIP Section */}
          <div className="mb-8">
            <h3 className="text-center font-semibold mb-2">Área VIP</h3>
            {['A', 'B', 'C', 'D', 'E'].map((row) => (
              <div key={row} className="flex justify-center mb-1">
                <span className="w-6 text-center mr-1">{row}</span>
                <div className="flex">
                  {filterSeatsBySection(activeSection).filter(seat => seat.section === 'VIP' && seat.row === row).map(seat => (
                    <button
                      key={seat.id}
                      className={`seat ${
                        seat.status === 'available' 
                          ? 'seat-available' 
                          : seat.status === 'selected' 
                          ? 'seat-selected' 
                          : 'seat-unavailable'
                      }`}
                      onClick={() => seat.status !== 'unavailable' && handleSeatClick(seat)}
                      disabled={seat.status === 'unavailable'}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Middle Aisle */}
          <div className="w-full border-t-2 border-gray-400 mb-8"></div>
          
          {/* Lateral Sections */}
          <div className="flex justify-between">
            <div className="w-[45%]">
              <h3 className="text-center font-semibold mb-2">Lateral Esquerda</h3>
              {['F', 'G', 'H', 'I', 'J'].map((row) => (
                <div key={row} className="flex mb-1">
                  <span className="w-6 text-center mr-1">{row}</span>
                  <div className="flex flex-wrap">
                    {filterSeatsBySection(activeSection).filter(seat => seat.section === 'Lateral-Esquerda' && seat.row === row).map(seat => (
                      <button
                        key={seat.id}
                        className={`seat ${
                          seat.status === 'available' 
                            ? 'seat-available' 
                            : seat.status === 'selected' 
                            ? 'seat-selected' 
                            : 'seat-unavailable'
                        }`}
                        onClick={() => seat.status !== 'unavailable' && handleSeatClick(seat)}
                        disabled={seat.status === 'unavailable'}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="w-[45%]">
              <h3 className="text-center font-semibold mb-2">Lateral Direita</h3>
              {['F', 'G', 'H', 'I', 'J'].map((row) => (
                <div key={row} className="flex justify-end mb-1">
                  <div className="flex flex-wrap justify-end">
                    {filterSeatsBySection(activeSection).filter(seat => seat.section === 'Lateral-Direita' && seat.row === row).map(seat => (
                      <button
                        key={seat.id}
                        className={`seat ${
                          seat.status === 'available' 
                            ? 'seat-available' 
                            : seat.status === 'selected' 
                            ? 'seat-selected' 
                            : 'seat-unavailable'
                        }`}
                        onClick={() => seat.status !== 'unavailable' && handleSeatClick(seat)}
                        disabled={seat.status === 'unavailable'}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                  <span className="w-6 text-center ml-1">{row}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StadiumMap;
