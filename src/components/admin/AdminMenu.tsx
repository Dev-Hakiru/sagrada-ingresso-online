
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Menu, X, Calendar, MapPin, Users, Ticket, BarChart3 } from 'lucide-react';

const AdminMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
    },
    {
      title: 'Jogos',
      href: '/admin/games',
      icon: Calendar,
    },
    {
      title: 'Setores',
      href: '/admin/sectors',
      icon: MapPin,
    },
    {
      title: 'Assentos',
      href: '/admin/seats',
      icon: Users,
    },
    {
      title: 'Bilhetes',
      href: '/admin/tickets',
      icon: Ticket,
    }
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-white shadow-lg"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="fixed top-16 right-4 z-40 w-64 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <Icon className="h-5 w-5 text-sagrada-green" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AdminMenu;
