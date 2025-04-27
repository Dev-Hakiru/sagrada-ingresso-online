
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate login
    setTimeout(() => {
      toast.success("Login realizado com sucesso!");
      navigate('/tickets');
      setIsSubmitting(false);
    }, 1500);
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate registration
    setTimeout(() => {
      toast.success("Cadastro realizado com sucesso!");
      navigate('/tickets');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="p-6">
              <h1 className="text-2xl font-bold mb-6">Entre na sua conta</h1>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu-email@exemplo.com" required />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Senha</Label>
                    <a 
                      href="#" 
                      className="text-xs text-sagrada-green hover:text-sagrada-green/90"
                      onClick={(e) => {
                        e.preventDefault();
                        toast('Funcionalidade em desenvolvimento', {
                          description: 'Por favor, tente novamente mais tarde.',
                        });
                      }}
                    >
                      Esqueceu a senha?
                    </a>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-sagrada-green hover:bg-sagrada-green/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="p-6">
              <h1 className="text-2xl font-bold mb-6">Criar uma conta</h1>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" placeholder="Seu nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" placeholder="Seu sobrenome" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <Input id="registerEmail" type="email" placeholder="seu-email@exemplo.com" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" type="tel" placeholder="+244 999 888 777" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Senha</Label>
                  <Input id="registerPassword" type="password" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input id="confirmPassword" type="password" required />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-sagrada-green hover:bg-sagrada-green/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processando...' : 'Cadastrar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
