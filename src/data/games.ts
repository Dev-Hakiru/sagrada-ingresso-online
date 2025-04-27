
import { Game } from "@/components/GameCard";

export const gamesData: Game[] = [
  {
    id: 1,
    homeTeam: "Sagrada Esperança",
    awayTeam: "Petro de Luanda",
    date: "2025-06-15",
    time: "15:00",
    category: "nacional",
    stadium: "Estádio Sagrada Esperança",
    price: 5000,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1470"
  },
  {
    id: 2,
    homeTeam: "Sagrada Esperança",
    awayTeam: "1º de Agosto",
    date: "2025-06-22",
    time: "15:00",
    category: "nacional",
    stadium: "Estádio Sagrada Esperança",
    price: 5000,
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1470"
  },
  {
    id: 3,
    homeTeam: "Sagrada Esperança",
    awayTeam: "Kaizer Chiefs",
    date: "2025-07-05",
    time: "18:30",
    category: "internacional",
    stadium: "Estádio Sagrada Esperança",
    price: 8000,
    image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=1476"
  },
  {
    id: 4,
    homeTeam: "Sagrada Esperança",
    awayTeam: "Académica do Lobito",
    date: "2025-07-12",
    time: "15:00",
    category: "nacional",
    stadium: "Estádio Sagrada Esperança",
    price: 5000,
    image: "https://images.unsplash.com/photo-1550881111-7cfde14b8073?q=80&w=1470"
  },
  {
    id: 5,
    homeTeam: "Sagrada Esperança",
    awayTeam: "Orlando Pirates",
    date: "2025-07-19",
    time: "20:00",
    category: "internacional",
    stadium: "Estádio Sagrada Esperança",
    price: 8000,
    image: "https://images.unsplash.com/photo-1577223625816-6cf3149ae747?q=80&w=1470"
  },
  {
    id: 6,
    homeTeam: "Sagrada Esperança",
    awayTeam: "Interclube",
    date: "2025-08-02",
    time: "15:00",
    category: "nacional",
    stadium: "Estádio Sagrada Esperança",
    price: 5000,
    image: "https://images.unsplash.com/photo-1542852869-c71151c612b4?q=80&w=1515"
  },
  {
    id: 7,
    homeTeam: "Sagrada Esperança",
    awayTeam: "Desportivo da Huíla",
    date: "2025-08-09",
    time: "15:00",
    category: "nacional",
    stadium: "Estádio Sagrada Esperança",
    price: 5000,
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1470"
  },
  {
    id: 8,
    homeTeam: "Sagrada Esperança",
    awayTeam: "FC Barcelona",
    date: "2025-08-16",
    time: "19:30",
    category: "amistoso",
    stadium: "Estádio Sagrada Esperança",
    price: 10000,
    image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1473"
  }
];

export const getGameById = (id: number): Game | undefined => {
  return gamesData.find(game => game.id === id);
};
