
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar permissões:', error);
          throw error;
        }

        setIsAdmin(!!data);
      } catch (error: any) {
        console.error('Erro ao verificar status de admin:', error);
        toast.error('Erro ao verificar permissões');
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading || checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sagrada-green"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    toast.error('Acesso negado. Você não tem permissões de administrador.');
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
};

export default AdminPage;
