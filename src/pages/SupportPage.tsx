
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const SupportPage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
  };
  
  const handleWhatsAppClick = () => {
    // Typically you would use a real WhatsApp business number
    window.open("https://wa.me/244999888777", "_blank");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Suporte</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">Entre em Contato</h2>
              <p className="text-gray-600 mb-6">
                Preencha o formulário abaixo e entraremos em contato com você o mais breve possível.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Seu nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu-email@exemplo.com" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input id="subject" placeholder="Como podemos ajudar?" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea id="message" placeholder="Detalhe sua solicitação..." className="h-32" required />
                </div>
                
                <Button type="submit" className="bg-sagrada-green hover:bg-sagrada-green/90">
                  Enviar Mensagem
                </Button>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">Atendimento pelo WhatsApp</h2>
              <p className="text-gray-600 mb-6">
                Para atendimento mais rápido, entre em contato conosco via WhatsApp.
              </p>
              
              <Button 
                onClick={handleWhatsAppClick} 
                className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-5 h-5 mr-2"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Falar pelo WhatsApp
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Informações de Contato</h2>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-medium">Endereço</h3>
                  <p className="text-gray-600">Estrada Nacional, Dundo, Angola</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600">info@sagradaesperanca.ao</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Telefone</h3>
                  <p className="text-gray-600">+244 999 888 777</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Horário de Atendimento</h3>
                  <p className="text-gray-600">Segunda a Sexta: 9h às 17h</p>
                  <p className="text-gray-600">Sábado: 9h às 13h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
