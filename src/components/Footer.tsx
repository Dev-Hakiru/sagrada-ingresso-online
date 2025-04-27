
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-sagrada-gray text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">Sagrada Esperança</h3>
            <p className="text-gray-300">
              Estádio Sagrada Esperança, destino para os melhores eventos esportivos em Angola.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">Links Úteis</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-sagrada-yellow transition-colors">Home</a></li>
              <li><a href="/games" className="hover:text-sagrada-yellow transition-colors">Jogos</a></li>
              <li><a href="/support" className="hover:text-sagrada-yellow transition-colors">Suporte</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">Contato</h3>
            <p className="text-gray-300">Estrada Nacional, Dundo, Angola</p>
            <p className="text-gray-300">Telefone: +244 999 888 777</p>
            <p className="text-gray-300">Email: info@sagradaesperanca.ao</p>
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
