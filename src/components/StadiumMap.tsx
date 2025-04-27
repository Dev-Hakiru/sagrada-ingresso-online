import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

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
};

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

const StadiumMap: React.FC<StadiumMapProps> = ({ selectedSeats, onSeatSelect }) => {
  // Generate seat data
  const vipSeats = generateSeats('VIP', ['A', 'B', 'C', 'D', 'E'], 20, 10000);
  const lateralLeftSeats = generateSeats('Lateral-Esquerda', ['F', 'G', 'H', 'I', 'J'], 25, 5000);
  const lateralRightSeats = generateSeats('Lateral-Direita', ['F', 'G', 'H', 'I', 'J'], 25, 5000);
  
  const [seats, setSeats] = useState<SeatType[]>([
    ...vipSeats, 
    ...lateralLeftSeats, 
    ...lateralRightSeats
  ]);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const handleSeatClick = (seatId: string) => {
    const updatedSeats = seats.map((seat) => {
      if (seat.id === seatId) {
        // Explicitly cast to the correct type
        const newStatus: 'available' | 'selected' = seat.status === 'selected' ? 'available' : 'selected';
        const updatedSeat = { ...seat, status: newStatus };
        
        // Notify parent component about seat selection change
        onSeatSelect(updatedSeat);
        
        return updatedSeat;
      }
      return seat;
    });
    
    setSeats(updatedSeats);
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
                      onClick={() => handleSeatClick(seat.id)}
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
                        onClick={() => handleSeatClick(seat.id)}
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
                        onClick={() => handleSeatClick(seat.id)}
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
