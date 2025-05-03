
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('multicaixa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(price);
  };
  
  // Check if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para finalizar a compra");
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Para cada jogo no carrinho, vamos criar um bilhete
      for (const item of items) {
        const ticketData = {
          user_id: user.id,
          game_id: item.gameId.toString(),
          game_title: item.gameTitle,
          date: item.date,
          time: item.time,
          stadium: "Estádio Nacional 11 de Novembro", // Poderíamos obter isso de um objeto game se disponível
          seats: item.seats
        };
        
        const { error } = await supabase
          .from('tickets')
          .insert(ticketData);
        
        if (error) {
          console.error("Erro ao salvar bilhete:", error);
          throw new Error(`Erro ao salvar bilhete: ${error.message}`);
        }
      }
      
      toast.success("Pagamento processado com sucesso! Seus bilhetes estão prontos.");
      clearCart();
      navigate('/tickets');
    } catch (error: any) {
      toast.error("Erro ao processar pagamento", {
        description: error.message || "Tente novamente mais tarde"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" placeholder="Seu nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" placeholder="Seu sobrenome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu-email@exemplo.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" placeholder="+244 999 888 777" required />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Método de Pagamento</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="multicaixa" id="multicaixa" />
                    <Label htmlFor="multicaixa" className="flex items-center">
                      <span className="mr-2">Multicaixa Express</span>
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/pt/3/31/Logotipo_Multicaixa_white.png" 
                        alt="Multicaixa" 
                        className="h-6 object-contain"
                      />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypay" id="paypay" />
                    <Label htmlFor="paypay" className="flex items-center">
                      <span className="mr-2">PayPay</span>
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#0066CC" />
                        <path d="M7 10.5H17M7 14.5H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'multicaixa' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-2">Instruções para Multicaixa Express</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Após confirmar o pedido, você receberá um SMS com instruções para completar
                      o pagamento através do Multicaixa Express.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Número do Telefone para Multicaixa</Label>
                      <Input id="multicaixa-phone" type="tel" placeholder="+244 999 888 777" required />
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'paypay' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-2">Detalhes do PayPay</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paypay-email">Email PayPay</Label>
                        <Input id="paypay-email" type="email" placeholder="seu-email@exemplo.com" required />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-sagrada-green hover:bg-sagrada-green/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : `Pagar ${formatPrice(totalPrice)}`}
              </Button>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold border-b border-gray-200 pb-4 mb-4">Resumo do Pedido</h2>
              
              {items.map((item) => (
                <div key={item.gameId} className="mb-4">
                  <h3 className="font-medium">{item.gameTitle}</h3>
                  <p className="text-sm text-gray-500">
                    {item.seats.length} {item.seats.length === 1 ? 'bilhete' : 'bilhetes'}
                  </p>
                  <div className="mt-2">
                    {item.seats.slice(0, 3).map((seat) => (
                      <div key={seat.id} className="text-xs text-gray-600">
                        {seat.section} - Fila {seat.row}, Assento {seat.number}
                      </div>
                    ))}
                    {item.seats.length > 3 && (
                      <div className="text-xs text-gray-600">
                        + {item.seats.length - 3} mais {item.seats.length - 3 === 1 ? 'assento' : 'assentos'}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 font-medium">
                    {formatPrice(item.seats.reduce((sum, seat) => sum + seat.price, 0))}
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
