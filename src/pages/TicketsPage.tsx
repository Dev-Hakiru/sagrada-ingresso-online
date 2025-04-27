import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';

// Iniciar com uma array vazia para representar que não há bilhetes
const tickets = [];

const TicketsPage = () => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };
  
  const handleDownloadTicket = (ticketId: number) => {
    // In a real app, this would generate and download a PDF or image ticket
    alert('Bilhete baixado!');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meus Bilhetes</h1>
        
        {tickets.length === 0 ? (
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
                    <h2 className="font-bold text-lg">{ticket.gameTitle}</h2>
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
                        <div key={idx} className="text-sm">
                          {seat.section} - Fila {seat.row}, Assento {seat.number}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleDownloadTicket(ticket.id)}
                    className="w-full mt-6 flex items-center justify-center bg-sagrada-green hover:bg-sagrada-green/90"
                  >
                    <Download size={16} className="mr-2" />
                    Baixar Bilhete
                  </Button>
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
