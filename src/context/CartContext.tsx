
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

// Try to load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const addToCart = (item: CartItem) => {
    // Check if game already in cart
    const existingIndex = items.findIndex(i => i.gameId === item.gameId);
    
    if (existingIndex !== -1) {
      // Update existing game
      const updatedItems = [...items];
      updatedItems[existingIndex] = item;
      setItems(updatedItems);
      console.log('Updated existing item in cart:', item);
    } else {
      // Add new game
      setItems(prev => [...prev, item]);
      console.log('Added new item to cart:', item);
    }
  };

  const removeFromCart = (gameId: number) => {
    setItems(prev => prev.filter(item => item.gameId !== gameId));
    console.log('Removed item from cart:', gameId);
  };

  const clearCart = () => {
    setItems([]);
    console.log('Cart cleared');
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
