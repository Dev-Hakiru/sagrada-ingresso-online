
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
    image: "/lovable-uploads/35678844-34f6-4592-8707-f77be41d6fdc.png"
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
    image: "/lovable-uploads/17d04499-4990-49fc-8c27-27ce0a7e55e6.png"
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
    image: "/lovable-uploads/44a10e08-bf1f-47c1-8757-bf86513c32fa.png"
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
    image: "/lovable-uploads/54339de4-a2f9-40eb-b9b4-b849c71b2498.png"
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
    image: "/lovable-uploads/bfc13a0f-b819-425e-bd07-4f6f0d018a79.png"
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
    image: "/lovable-uploads/34537056-bee3-4d8a-85b7-ce56582e10eb.png"
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
    image: "/lovable-uploads/25b35227-ad99-4fb0-adac-3acfa8ebf67d.png"
  }
];

export const getGameById = (id: number): Game | undefined => {
  return gamesData.find(game => game.id === id);
};
