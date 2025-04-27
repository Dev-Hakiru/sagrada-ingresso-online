
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Calendar, X } from 'lucide-react';

const CartPage = () => {
  const { items, removeFromCart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(price);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-6">Você ainda não adicionou nenhum bilhete ao carrinho.</p>
            <Button onClick={() => navigate('/games')} className="bg-sagrada-green hover:bg-sagrada-green/90">
              Ver Jogos Disponíveis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {items.map((item) => (
                <div key={item.gameId} className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-lg">{item.gameTitle}</h2>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Calendar size={16} className="mr-1" />
                        <span className="text-sm">{formatDate(item.date)} às {item.time}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.gameId)} 
                      className="text-gray-500 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-medium mb-3">Assentos</h3>
                    <div className="space-y-2">
                      {item.seats.map((seat) => (
                        <div key={seat.id} className="flex justify-between text-sm">
                          <span>{seat.section} - Fila {seat.row}, Assento {seat.number}</span>
                          <span className="font-medium">{formatPrice(seat.price)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                      <span className="font-medium">Subtotal ({item.seats.length} {item.seats.length === 1 ? 'assento' : 'assentos'})</span>
                      <span className="font-bold">
                        {formatPrice(item.seats.reduce((sum, seat) => sum + seat.price, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-5 sticky top-24">
                <h2 className="text-xl font-semibold border-b border-gray-200 pb-4 mb-4">Resumo do Pedido</h2>
                
                {items.map((item) => (
                  <div key={item.gameId} className="flex justify-between mb-2 text-sm">
                    <span>{item.gameTitle} ({item.seats.length} {item.seats.length === 1 ? 'bilhete' : 'bilhetes'})</span>
                    <span>
                      {formatPrice(item.seats.reduce((sum, seat) => sum + seat.price, 0))}
                    </span>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-6">
                  <Button 
                    onClick={handleCheckout} 
                    className="bg-sagrada-green hover:bg-sagrada-green/90 w-full"
                  >
                    Finalizar Compra
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => clearCart()}
                    className="w-full"
                  >
                    Esvaziar Carrinho
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
