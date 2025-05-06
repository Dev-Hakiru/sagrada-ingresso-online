
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type CancelPurchaseButtonProps = {
  purchaseId: string;
  onCancel: () => void;
};

// Define a type for the seat object structure
interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
}

const CancelPurchaseButton = ({ purchaseId, onCancel }: CancelPurchaseButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleCancel = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cancelar a compra.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Pegar informações do bilhete para saber quais assentos liberar
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', purchaseId)
        .eq('user_id', user.id)
        .single();
      
      if (ticketError || !ticketData) {
        throw new Error("Bilhete não encontrado ou você não tem permissão para cancelá-lo.");
      }

      // 2. Para cada assento no bilhete, atualizar o status para 'available'
      if (ticketData.seats && Array.isArray(ticketData.seats)) {
        const seatUpdates = ticketData.seats.map((seatItem: any) => {
          // Type guard to check if the seat is an object
          if (seatItem && typeof seatItem === 'object') {
            const seatObj = seatItem as Record<string, any>;
            
            // Verify that the seat object has all required properties
            if (
              typeof seatObj.id === 'string' &&
              typeof seatObj.row === 'string' &&
              typeof seatObj.number === 'number' &&
              typeof seatObj.section === 'string'
            ) {
              // Now we can safely treat it as a Seat
              const seat: Seat = {
                id: seatObj.id,
                row: seatObj.row,
                number: seatObj.number,
                section: seatObj.section,
                price: seatObj.price
              };
              
              // Return a promise for updating this seat
              return supabase
                .from('seats')
                .update({
                  status: 'available',
                  reserved_by: null,
                  reserved_until: null
                })
                .eq('id', seat.id);
            }
          }
          return null;
        }).filter(Boolean);
        
        // Execute all seat updates in parallel
        await Promise.all(seatUpdates);
      }

      // 3. Excluir o registro do bilhete - Ensuring this completes
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', purchaseId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      toast({
        title: "Compra cancelada",
        description: "A sua compra foi cancelada com sucesso e os assentos estão disponíveis novamente.",
      });
      
      // First close the dialog 
      setIsOpen(false);
      
      // Trigger the refresh callback with a delay to ensure database operations have completed
      setTimeout(() => {
        onCancel();
      }, 500);
      
    } catch (error: any) {
      console.error("Erro ao cancelar a compra:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao cancelar a compra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <X size={16} />
        <span>Cancelar Compra</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancelar Compra</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta compra? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? "Cancelando..." : "Cancelar Compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CancelPurchaseButton;
