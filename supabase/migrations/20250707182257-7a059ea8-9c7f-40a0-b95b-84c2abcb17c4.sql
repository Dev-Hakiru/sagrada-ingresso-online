
-- Criar tabela de games (jogos)
CREATE TABLE IF NOT EXISTS public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_jogo TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de sectors (setores)
CREATE TABLE IF NOT EXISTS public.sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_setor TEXT NOT NULL,
  capacidade INTEGER NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela seats existente para incluir setor_id
ALTER TABLE public.seats 
ADD COLUMN IF NOT EXISTS setor_id UUID REFERENCES public.sectors(id),
ADD COLUMN IF NOT EXISTS codigo_assento TEXT;

-- Atualizar tabela tickets existente para incluir campos necessários
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS seat_id UUID,
ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago', 'cancelado')),
ADD COLUMN IF NOT EXISTS codigo_qr TEXT,
ADD COLUMN IF NOT EXISTS data_compra TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar tabela de user_roles para controle de acesso admin
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para games (apenas admins podem gerenciar)
CREATE POLICY "Admins podem gerenciar jogos" ON public.games
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Qualquer pessoa pode ver jogos" ON public.games
FOR SELECT USING (true);

-- Políticas para sectors (apenas admins podem gerenciar)
CREATE POLICY "Admins podem gerenciar setores" ON public.sectors
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Qualquer pessoa pode ver setores" ON public.sectors
FOR SELECT USING (true);

-- Políticas para user_roles (apenas admins podem ver/gerenciar)
CREATE POLICY "Admins podem gerenciar roles" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
$$;

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER sectors_updated_at
  BEFORE UPDATE ON public.sectors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
