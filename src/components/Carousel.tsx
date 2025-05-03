
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type CarouselItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
};

const items: CarouselItem[] = [
  {
    id: 1,
    title: "Sagrada Esperança vs. Petro de Luanda",
    description: "Final do Campeonato Angolano 2023",
    image: "/lovable-uploads/imagem-06.jpg",
    link: "/games/1"
  },
  {
    id: 2,
    title: "Torneio Internacional Amistoso",
    description: "Sagrada Esperança enfrenta times da África do Sul",
    image: "/lovable-uploads/imagem-05.jpg",
    link: "/games/2"
  },
  {
    id: 3,
    title: "Campeonato Nacional de Angola",
    description: "Assista todos os jogos em casa do Sagrada Esperança",
    image: "/lovable-uploads/imagem-01.jpg",
    link: "/games"
  }
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-container">
      <div 
        className="carousel-slide" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="carousel-item"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <div className="carousel-content">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{item.title}</h2>
              <p className="text-lg md:text-xl mb-6">{item.description}</p>
              <Link to={item.link}>
                <Button className="btn-secondary">Comprar Bilhetes</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? "bg-sagrada-yellow" : "bg-white bg-opacity-50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
