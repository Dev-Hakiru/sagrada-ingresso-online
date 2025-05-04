
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticketData, userId } = await req.json();
    
    if (!ticketData || !userId) {
      return new Response(
        JSON.stringify({ error: "Dados do bilhete e ID do usuário são obrigatórios" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Buscar informações do usuário
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();
    
    if (userError) {
      throw new Error("Erro ao buscar dados do usuário");
    }

    // Criar o documento PDF
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a5",
    });

    // Definir fontes e cores
    doc.setFillColor(20, 130, 60); // Cor verde do tema Sagrada
    doc.rect(0, 0, 210, 15, "F"); // Barra superior
    doc.rect(0, 133, 210, 15, "F"); // Barra inferior
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("GD SAGRADA ESPERANÇA - BILHETE OFICIAL", 105, 10, { align: "center" });
    
    // Conteúdo do bilhete
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.text(ticketData.homeTeam + " vs " + ticketData.awayTeam, 105, 30, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Data: " + new Date(ticketData.date).toLocaleDateString('pt-BR'), 105, 45, { align: "center" });
    doc.text("Hora: " + ticketData.time, 105, 55, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("Setor: " + ticketData.sector, 40, 75);
    doc.text("Fila: " + ticketData.row, 40, 85);
    doc.text("Assento: " + ticketData.seat, 40, 95);
    doc.text("Preço: " + ticketData.price + " Kz", 40, 105);
    
    doc.setFontSize(12);
    doc.text("Nome do Comprador:", 125, 70);
    doc.setFontSize(14);
    doc.text(`${userData.first_name} ${userData.last_name}`, 125, 80);
    
    doc.setFontSize(12);
    doc.text("ID da Compra: " + ticketData.purchaseId, 125, 95);
    doc.text("Emitido em: " + new Date().toLocaleDateString('pt-BR'), 125, 105);
    
    // Adicionar imagem do bilhete de acordo com o jogo e setor
    // Jogos 1, 3 e 5 terão imagens diferentes
    let imagePath = '';
    
    // Determinar qual imagem usar baseada no gameId e setor
    if (ticketData.gameId === 1) { // Primeiro jogo
      if (ticketData.sector === 'A') { // VIP
        imagePath = '/lovable-uploads/baed7d58-3282-4575-b27d-36e04fee7f88.png'; // VIP1
      } else if (ticketData.sector === 'B') { // Normal Esquerda
        imagePath = '/lovable-uploads/4c4a649b-1429-427e-b9cd-153a70b7cd82.png'; // 001
      } else { // Normal Direita
        imagePath = '/lovable-uploads/f84e6724-2bc7-4c7d-a8d8-a3c63b731d44.png'; // 01
      }
    } else if (ticketData.gameId === 3) { // Terceiro jogo
      if (ticketData.sector === 'A') { // VIP
        imagePath = '/lovable-uploads/4d81cb46-6e46-4286-b958-a44c1e3a0d7c.png'; // VIP2
      } else if (ticketData.sector === 'B') { // Normal Esquerda
        imagePath = '/lovable-uploads/7ac42e4e-5a81-46ce-8f20-cbff78bb541c.png'; // 002
      } else { // Normal Direita
        imagePath = '/lovable-uploads/050a8987-360c-49c0-9318-db0a012a25ca.png'; // 02
      }
    } else if (ticketData.gameId === 5) { // Quinto jogo
      if (ticketData.sector === 'A') { // VIP
        imagePath = '/lovable-uploads/3b8d2e1a-3960-4887-9b9d-34d285177e28.png'; // VIP3
      } else if (ticketData.sector === 'B') { // Normal Esquerda
        imagePath = '/lovable-uploads/f4cb1efb-1298-4516-a950-048787549d25.png'; // 003
      } else { // Normal Direita
        imagePath = '/lovable-uploads/80431cd5-6ae3-4a9c-917c-975bf4b11a61.png'; // 03
      }
    }
    
    // Se tiver uma imagem definida, adicionar um retângulo simulando o ingresso visual
    if (imagePath) {
      // Adicionar uma representação visual do bilhete
      doc.setDrawColor(20, 130, 60);
      doc.setLineWidth(0.5);
      doc.roundedRect(150, 110, 30, 20, 2, 2, 'S');
      doc.setFontSize(7);
      doc.text(`* Este bilhete contém uma imagem visual`, 165, 127, { align: "center" });
      doc.text(`disponível no site`, 165, 131, { align: "center" });
    } else {
      // QR Code (simulado)
      doc.setDrawColor(0);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(150, 110, 30, 30, 2, 2, "FD");
      doc.setFontSize(6);
      doc.text("Código QR do Bilhete", 165, 127, { align: "center" });
    }
    
    // Adicionar informações adicionais sobre o estádio
    doc.setFontSize(8);
    doc.text("Estádio: " + ticketData.stadium, 105, 115, { align: "center" });
    doc.text("Portal de Entrada: De acordo com seu setor", 105, 120, { align: "center" });
    
    // Rodapé
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("Este bilhete é válido para uma única entrada. Preserve-o até o término do evento.", 105, 140, { align: "center" });
    
    // Gerar o PDF como base64
    const pdfOutput = doc.output();
    const pdfBase64 = Buffer.from(pdfOutput).toString("base64");

    return new Response(
      JSON.stringify({ pdf: pdfBase64 }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao gerar o PDF" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
