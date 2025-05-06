
import React from 'react';
import Layout from '@/components/Layout';
import Carousel from '@/components/Carousel';
import GameCard, { Game } from '@/components/GameCard';
import { gamesData } from '@/data/games';
import { Link } from 'react-router-dom';

const Index = () => {
  // Get only the upcoming 4 games for the home page
  const upcomingGames = gamesData.slice(0, 4);
  
  return (
    <Layout>
      <section className="w-full">
        <Carousel />
      </section>
      
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-sagrada-gray">Próximos Jogos</h2>
          <Link to="/games" className="text-sagrada-green hover:text-opacity-80 font-semibold">
            Ver Todos
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
      
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-sagrada-gray">
            Estádio Sagrada Esperança
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="/lovable-uploads/007bb97b-415b-4d42-bf61-d334b326afb9.png" 
                alt="Estádio Sagrada Esperança" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">O palco do futebol na Lunda Norte</h3>
              <p className="text-gray-700 mb-4">
                Localizado no coração do Dundo, o Estádio Sagrada Esperança é a casa oficial do Grupo Desportivo Sagrada Esperança e um dos mais importantes centros desportivos do leste de Angola.
              </p>
              <p className="text-gray-700 mb-4">
                Com capacidade para 8.000 a 10.000 espectadores, o estádio oferece uma infraestrutura moderna: relvado natural, camarotes, área VIP, balneários equipados e espaço para imprensa.
              </p>
              <p className="text-gray-700 mb-4">
                Apoiado pela Endiama E.P., o estádio recebe jogos do Girabola, Taça de Angola e competições internacionais, sendo um símbolo de orgulho e desenvolvimento para a província da Lunda Norte.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link to="/games" className="btn-primary inline-block text-center">
                  Comprar Bilhetes
                </Link>
                <Link to="/support" className="btn-secondary inline-block text-center">
                  Contato
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-sagrada-gray">
          Por que comprar online?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 card">
            <div className="rounded-full bg-sagrada-green/10 w-16 h-16 mb-4 mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sagrada-green">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rápido e Fácil</h3>
            <p className="text-gray-600">
              Compre seus bilhetes em segundos, sem filas ou esperas.
            </p>
          </div>
          
          <div className="text-center p-6 card">
            <div className="rounded-full bg-sagrada-green/10 w-16 h-16 mb-4 mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sagrada-green">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Garantia de Assentos</h3>
            <p className="text-gray-600">
              Escolha os melhores lugares com antecedência.
            </p>
          </div>
          
          <div className="text-center p-6 card">
            <div className="rounded-full bg-sagrada-green/10 w-16 h-16 mb-4 mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sagrada-green">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Seguro</h3>
            <p className="text-gray-600">
              Pagamento seguro e bilhetes digitais verificados.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
