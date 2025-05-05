
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type CancelPurchaseButtonProps = {
  purchaseId: string;
  onCancel: () => void;
};

const CancelPurchaseButton = ({ purchaseId, onCancel }: CancelPurchaseButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      // Aqui seria implementada a lógica para cancelar a compra no backend
      // Simulando um atraso de processamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Compra cancelada",
        description: "A sua compra foi cancelada com sucesso.",
      });
      
      onCancel();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cancelar a compra. Tente novamente.",
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
