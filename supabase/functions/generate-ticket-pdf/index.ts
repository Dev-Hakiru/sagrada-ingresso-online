
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
    
    // QR Code (simulado)
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(150, 110, 30, 30, 2, 2, "FD");
    doc.setFontSize(6);
    doc.text("Código QR do Bilhete", 165, 127, { align: "center" });
    
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
