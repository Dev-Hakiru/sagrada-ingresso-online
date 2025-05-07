
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type Ticket = {
  id: string;
  purchaseId: string;
  gameId: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stadium: string;
  sector: string;
  row: string;
  seat: string;
  price: number;
};

type TicketCardProps = {
  ticket: Ticket;
  onDownload: () => void;
};

const TicketCard = ({ ticket, onDownload }: TicketCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {ticket.homeTeam} vs {ticket.awayTeam}
            </h3>
            <p className="text-gray-600 mb-1">
              {formatDate(ticket.date)} às {ticket.time}
            </p>
            <p className="text-gray-600">{ticket.stadium}</p>
            
            <div className="mt-4 space-y-1">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">Setor:</span>
                <span className="col-span-2 font-medium">{ticket.sector}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">Fila:</span>
                <span className="col-span-2 font-medium">{ticket.row}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">Assento:</span>
                <span className="col-span-2 font-medium">{ticket.seat}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-between mt-4 md:mt-0">
            <div className="text-right">
              <span className="bg-sagrada-green/10 text-sagrada-green px-3 py-1 rounded-full text-sm font-medium">
                ID: {ticket.id.substring(0, 8)}
              </span>
            </div>
            <div className="mt-4 md:mt-auto">
              <p className="text-lg font-bold text-sagrada-green text-right mb-2">
                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(ticket.price)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end p-6 pt-0 border-t">
        <Button variant="outline" className="gap-2" onClick={onDownload}>
          <Download size={16} />
          <span>Download PDF</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TicketCard;
