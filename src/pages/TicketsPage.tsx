
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
}

interface Ticket {
  id: string;
  game_title: string;
  date: string;
  time: string;
  stadium: string;
  seats: Seat[];
  created_at: string;
  game_id: string;
}

const TicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match the Ticket interface
        // The main issue is that seats is stored as JSON in the database
        // but we need it as a Seat[] array in our component
        const transformedTickets: Ticket[] = (data || []).map((ticket: any) => ({
          id: ticket.id,
          game_title: ticket.game_title,
          date: ticket.date,
          time: ticket.time,
          stadium: ticket.stadium,
          seats: Array.isArray(ticket.seats) ? ticket.seats : [],
          created_at: ticket.created_at,
          game_id: ticket.game_id
        }));
        
        setTickets(transformedTickets);
      } catch (error: any) {
        console.error('Erro ao carregar bilhetes:', error);
        toast.error('Erro ao carregar bilhetes', {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, [user]);
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };
  
  const handleDownloadTicket = async (ticket: Ticket, seat: Seat) => {
    if (!user) return;
    
    try {
      toast.info('Gerando bilhete, aguarde...');
      
      // Preparar os dados do bilhete para enviar à função Edge
      const ticketData = {
        homeTeam: ticket.game_title.split(' vs ')[0],
        awayTeam: ticket.game_title.split(' vs ')[1],
        date: ticket.date,
        time: ticket.time,
        sector: seat.section,
        row: seat.row,
        seat: seat.number,
        price: seat.price,
        stadium: ticket.stadium,
        purchaseId: ticket.id.slice(0, 8).toUpperCase()
      };
      
      // Chamar a função Edge para gerar o PDF
      const { data, error } = await supabase.functions.invoke('generate-ticket-pdf', {
        body: {
          ticketData,
          userId: user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Converter base64 para blob e gerar URL de download
      const base64Data = data.pdf;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Criar link de download e clicar nele automaticamente
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `bilhete-${ticket.game_title.replace(' vs ', '-')}-${seat.section}-${seat.row}-${seat.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Bilhete baixado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao baixar bilhete:', error);
      toast.error('Erro ao gerar bilhete', {
        description: error.message || 'Tente novamente mais tarde'
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meus Bilhetes</h1>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sagrada-green"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Você não tem bilhetes</h2>
            <p className="text-gray-600 mb-6">Você ainda não comprou nenhum bilhete.</p>
            <Button onClick={() => window.location.href = '/games'} className="bg-sagrada-green hover:bg-sagrada-green/90">
              Ver Jogos Disponíveis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-sagrada-green"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h2 className="font-bold text-lg">{ticket.game_title}</h2>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md">Ativo</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 my-2">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">{formatDate(ticket.date)} às {ticket.time}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm">{ticket.stadium}</p>
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-sm mb-1">Assentos</h3>
                    <div className="space-y-1">
                      {ticket.seats.map((seat, idx) => (
                        <div key={idx} className="text-sm flex justify-between items-center">
                          <span>{seat.section} - Fila {seat.row}, Assento {seat.number}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto" 
                            onClick={() => handleDownloadTicket(ticket, seat)}
                          >
                            <Download size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TicketsPage;
