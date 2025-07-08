
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  Settings,
  LogOut,
  BarChart3
} from 'lucide-react';

const AdminLayout = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      exact: true
    },
    {
      title: 'Jogos',
      href: '/admin/games',
      icon: Calendar
    },
    {
      title: 'Setores',
      href: '/admin/sectors',
      icon: MapPin
    },
    {
      title: 'Assentos',
      href: '/admin/seats',
      icon: Users
    },
    {
      title: 'Bilhetes',
      href: '/admin/tickets',
      icon: Ticket
    }
  ];

  const isActiveRoute = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-sagrada-green" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">GDSE Admin</h1>
                <p className="text-sm text-gray-500">Painel Administrativo</p>
              </div>
            </Link>
          </div>
          
          <Separator />
          
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href, item.exact);
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sagrada-green text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-4 right-4">
            <Separator className="mb-4" />
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
