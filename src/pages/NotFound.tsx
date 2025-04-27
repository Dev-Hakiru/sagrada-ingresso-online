
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-bold text-sagrada-green mb-4">404</h1>
          <p className="text-2xl font-medium text-sagrada-gray mb-6">
            Oops! Página não encontrada
          </p>
          <p className="text-gray-600 mb-8">
            A página que você está procurando não existe ou foi removida.
          </p>
          <Link to="/">
            <Button className="bg-sagrada-green hover:bg-sagrada-green/90">
              Voltar para Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
