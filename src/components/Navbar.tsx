
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
    : user?.email?.split('@')[0] || 'Usuário';

  return (
    <nav className="bg-sagrada-green text-white shadow-md fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/32aef663-dbd3-4fc8-8452-1f57449edc02.png" 
            alt="GD Sagrada Esperança Logo" 
            className="h-10 w-auto"
          />
          <span className="font-bold text-xl">GD Sagrada Esperança</span>
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
          {user && (
            <Link to="/tickets" className="hover:text-sagrada-yellow transition-colors">Meus Bilhetes</Link>
          )}
          <Link to="/support" className="hover:text-sagrada-yellow transition-colors">Suporte</Link>
          <Link to="/cart" className="hover:text-sagrada-yellow transition-colors">
            <ShoppingCart size={20} />
          </Link>
          
          {!user ? (
            <Link to="/login" className="hover:text-sagrada-yellow transition-colors">
              <User size={20} />
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 hover:text-sagrada-yellow transition-colors">
                <span className="text-sm hidden lg:inline-block max-w-[150px] truncate">{displayName}</span>
                <User size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="space-x-2" onClick={() => navigate('/tickets')}>
                  <Ticket size={16} />
                  <span>Meus Bilhetes</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="space-x-2 text-red-500" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden animate-slide-in bg-sagrada-green border-t border-sagrada-green/20">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
            <Link to="/" className="py-2 hover:text-sagrada-yellow transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/games" className="py-2 hover:text-sagrada-yellow transition-colors" onClick={() => setIsOpen(false)}>Jogos</Link>
            {user && (
              <Link to="/tickets" className="py-2 hover:text-sagrada-yellow transition-colors" onClick={() => setIsOpen(false)}>Meus Bilhetes</Link>
            )}
            <Link to="/support" className="py-2 hover:text-sagrada-yellow transition-colors" onClick={() => setIsOpen(false)}>Suporte</Link>
            <Link to="/cart" className="py-2 hover:text-sagrada-yellow transition-colors flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <ShoppingCart size={20} />
              <span>Carrinho</span>
            </Link>
            
            {!user ? (
              <Link to="/login" className="py-2 hover:text-sagrada-yellow transition-colors flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <User size={20} />
                <span>Entrar</span>
              </Link>
            ) : (
              <>
                <div className="py-2 font-medium">
                  Olá, {displayName}
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="py-2 text-red-400 hover:text-red-300 transition-colors flex items-center space-x-2"
                >
                  <LogOut size={20} />
                  <span>Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
