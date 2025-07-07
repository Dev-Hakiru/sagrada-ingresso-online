
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CheckRolePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar role:', error);
          navigate('/', { replace: true });
          return;
        }

        // Se o usuário tem role de admin, redireciona para /admin
        if (userRole?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          // Caso contrário, redireciona para a home
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Erro ao verificar role do usuário:', error);
        navigate('/', { replace: true });
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkUserRole();
    }
  }, [user, loading, navigate]);

  if (loading || checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sagrada-green"></div>
        <p className="ml-4 text-gray-600">Verificando permissões...</p>
      </div>
    );
  }

  return null;
};

export default CheckRolePage;
