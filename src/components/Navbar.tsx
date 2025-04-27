
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-sagrada-green text-white shadow-md fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Sagrada Esperança</span>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden focus:outline-none" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <Link to="/" className="hover:text-sagrada-yellow transition-colors">Home</Link>
          <Link to="/games" className="hover:text-sagrada-yellow transition-colors">Jogos</Link>
          <Link to="/tickets" className="hover:text-sagrada-yellow transition-colors">Meus Bilhetes</Link>
          <Link to="/support" className="hover:text-sagrada-yellow transition-colors">Suporte</Link>
          <Link to="/cart" className="hover:text-sagrada-yellow transition-colors">
            <ShoppingCart size={20} />
          </Link>
          <Link to="/login" className="hover:text-sagrada-yellow transition-colors">
            <User size={20} />
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden animate-slide-in bg-sagrada-green border-t border-sagrada-green/20">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
            <Link to="/" className="py-2 hover:text-sagrada-yellow transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/games" className="py-2 hover:text-sagrada-yellow transition-colors" onClick={() => setIsOpen(false)}>Jogos</Link>
            <Link to="/tickets" className="py-2 hover:text-sagrada-yellow transition-colors" onClick={() => setIsOpen(false)}>Meus Bilhetes</Link>
            <Link to="/support" className="py-2 hover:text-sagrada-yellow transition-colors" onClick={() => setIsOpen(false)}>Suporte</Link>
            <Link to="/cart" className="py-2 hover:text-sagrada-yellow transition-colors flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <ShoppingCart size={20} />
              <span>Carrinho</span>
            </Link>
            <Link to="/login" className="py-2 hover:text-sagrada-yellow transition-colors flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <User size={20} />
              <span>Entrar</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
