import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetPassOpen, setResetPassOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Verificar se o usuário já está logado
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Redirect to check-role page to determine proper destination
        navigate('/check-role');
      }
    };
    
    checkSession();
    
    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          // Redirect to check-role page to determine proper destination
          navigate('/check-role');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login realizado com sucesso!");
      // Navigate to check-role after successful login
      navigate('/check-role');
    } catch (error: any) {
      toast.error("Erro ao fazer login", {
        description: error.message || "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('registerEmail') as string;
    const password = formData.get('registerPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            phone
          },
        },
      });
      
      if (error) throw error;
      
      toast.success("Cadastro realizado com sucesso!", {
        description: "Verifique seu email para confirmar a conta."
      });
    } catch (error: any) {
      toast.error("Erro ao fazer cadastro", {
        description: error.message || "Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Schema para validação do formulário de redefinição de senha
  const resetPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
  });

  // Formulário para redefinição de senha
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Função para solicitar redefinição de senha
  const handleResetPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
      
      setResetEmailSent(true);
      toast.success("Email de redefinição enviado", {
        description: "Verifique sua caixa de entrada para redefinir sua senha."
      });
    } catch (error: any) {
      toast.error("Erro ao solicitar redefinição", {
        description: error.message || "Verifique o email informado e tente novamente.",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with tab buttons */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'login'
                    ? 'border-b-2 border-sagrada-green text-sagrada-green'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'register'
                    ? 'border-b-2 border-sagrada-green text-sagrada-green'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cadastrar
              </button>
            </div>
          </div>
          
          {/* Login form */}
          {activeTab === 'login' && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Entre na sua conta</h1>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="seu-email@exemplo.com" required />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Senha</Label>
                    <button 
                      type="button"
                      className="text-xs text-sagrada-green hover:text-sagrada-green/90"
                      onClick={() => setResetPassOpen(true)}
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <Input id="password" name="password" type="password" required />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-sagrada-green hover:bg-sagrada-green/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </div>
          )}
          
          {/* Register form */}
          {activeTab === 'register' && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Criar uma conta</h1>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" name="firstName" placeholder="Seu nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" name="lastName" placeholder="Seu sobrenome" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <Input id="registerEmail" name="registerEmail" type="email" placeholder="seu-email@exemplo.com" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+244 999 888 777" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Senha</Label>
                  <Input id="registerPassword" name="registerPassword" type="password" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-sagrada-green hover:bg-sagrada-green/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal de redefinição de senha */}
      <Dialog open={resetPassOpen} onOpenChange={setResetPassOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>
              {resetEmailSent 
                ? "Email de redefinição de senha enviado. Verifique sua caixa de entrada."
                : "Informe seu email para receber instruções de redefinição de senha."}
            </DialogDescription>
          </DialogHeader>
          
          {!resetEmailSent && (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu-email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-sagrada-green hover:bg-sagrada-green/90 w-full">
                  {resetPasswordForm.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    'Enviar instruções'
                  )}
                </Button>
              </form>
            </Form>
          )}
          
          {resetEmailSent && (
            <Button 
              onClick={() => setResetPassOpen(false)} 
              className="w-full bg-sagrada-green hover:bg-sagrada-green/90"
            >
              Fechar
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LoginPage;
