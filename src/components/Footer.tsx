
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-sagrada-gray text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-3">GD Sagrada Esperança</h3>
            <p className="text-gray-300 text-center md:text-left">
              Estádio Sagrada Esperança, destino para os melhores eventos esportivos em Angola.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-3">Links Úteis</h3>
            <ul className="space-y-2 text-center md:text-left">
              <li><Link to="/" className="hover:text-sagrada-yellow transition-colors">Home</Link></li>
              <li><Link to="/games" className="hover:text-sagrada-yellow transition-colors">Jogos</Link></li>
              <li><Link to="/support" className="hover:text-sagrada-yellow transition-colors">Suporte</Link></li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-3">Contato</h3>
            <div className="space-y-2 text-center md:text-left">
              <p className="flex items-center justify-center md:justify-start text-gray-300">
                <MapPin size={16} className="mr-2" />
                Estrada Nacional, Dundo, Angola
              </p>
              <p className="flex items-center justify-center md:justify-start text-gray-300">
                <Phone size={16} className="mr-2" />
                +244 999 888 777
              </p>
              <p className="flex items-center justify-center md:justify-start text-gray-300">
                <Mail size={16} className="mr-2" />
                info@sagradaesperanca.ao
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Estádio Sagrada Esperança. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
