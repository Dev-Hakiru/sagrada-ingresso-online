
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Seat = {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
};

type CartItem = {
  gameId: number;
  gameTitle: string;
  date: string;
  time: string;
  seats: Seat[];
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (gameId: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    // Check if game already in cart
    const existingIndex = items.findIndex(i => i.gameId === item.gameId);
    
    if (existingIndex !== -1) {
      // Update existing game
      const updatedItems = [...items];
      updatedItems[existingIndex] = item;
      setItems(updatedItems);
    } else {
      // Add new game
      setItems([...items, item]);
    }
  };

  const removeFromCart = (gameId: number) => {
    setItems(items.filter(item => item.gameId !== gameId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((sum, item) => 
    sum + item.seats.reduce((seatSum, seat) => seatSum + seat.price, 0), 0);

  const totalItems = items.reduce((sum, item) => sum + item.seats.length, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    totalPrice,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
