
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    multicaixaPhone: ''
  });
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(price);
  };
  
  // Check if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para finalizar a compra");
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error("Seu carrinho está vazio");
      navigate('/cart');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Processing checkout with items:", items);
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
        
        // 1. Inserir o bilhete na tabela tickets
        const { data: ticketResult, error } = await supabase
          .from('tickets')
          .insert(ticketData)
          .select();
        
        if (error) {
          console.error("Erro ao salvar bilhete:", error);
          throw new Error(`Erro ao salvar bilhete: ${error.message}`);
        }
        
        console.log("Ticket created successfully:", ticketResult);
        
        // 2. Atualizar o status dos assentos para 'sold'
        for (const seat of item.seats) {
          const { error: seatError } = await supabase
            .from('seats')
            .update({ 
              status: 'sold',
              reserved_by: user.id 
            })
            .eq('id', seat.id);
              
          if (seatError) {
            console.error(`Erro ao atualizar assento ${seat.id}:`, seatError);
          } else {
            console.log(`Seat ${seat.id} marked as sold`);
          }
        }
      }
      
      toast.success("Pagamento processado com sucesso! Seus bilhetes estão prontos.");
      clearCart(); // Clear the cart after successful purchase
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
                    <Input 
                      id="firstName" 
                      placeholder="Seu nome" 
                      required 
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Seu sobrenome" 
                      required 
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu-email@exemplo.com" 
                      required 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+244 999 888 777" 
                      required 
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Método de Pagamento</h2>
                <RadioGroup defaultValue="multicaixa">
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="multicaixa" id="multicaixa" />
                    <Label htmlFor="multicaixa" className="flex items-center">
                      <span className="mr-2">Multicaixa Express</span>
                      <img 
                        src="/lovable-uploads/40ff87f1-a1ca-4526-a809-2382a6527f97.png" 
                        alt="Multicaixa Express" 
                        className="h-10 object-contain"
                      />
                    </Label>
                  </div>
                </RadioGroup>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Instruções para Multicaixa Express</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Após confirmar o pedido, você receberá um SMS com instruções para completar
                    o pagamento através do Multicaixa Express.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="multicaixaPhone">Número do Telefone para Multicaixa</Label>
                    <Input 
                      id="multicaixaPhone" 
                      type="tel" 
                      placeholder="+244 999 888 777" 
                      required 
                      value={formData.multicaixaPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
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
