"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-client";

interface ResultadoProps {
  contenido: string;
  titulo: string;
}

export default function ResultadoPDF({ contenido, titulo }: ResultadoProps) {
  const [generando, setGenerando] = useState(false);

  async function descargarPDF() {
    setGenerando(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("DocenApp", 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(titulo, 20, 32);
    
    doc.setFontSize(10);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 36, 190, 36);
    
    doc.setFontSize(9);
    const lineas = doc.splitTextToSize(contenido, 170);
    doc.text(lineas, 20, 44);
    
    doc.save(titulo.replace(/ /g, "_") + ".pdf");
    setGenerando(false);
  }

  async function imprimirDoc() {
    const ventana = window.open("", "_blank");
    if (!ventana) return;
    ventana.document.write(`
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #4338ca; font-size: 20px; }
            h2 { color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6; }
            .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <h1>DocenApp</h1>
          <h2>${titulo}</h2>
          <pre>${contenido}</pre>
          <div class="footer">Generado con DocenApp — Herramientas IA para docentes chilenos</div>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={() => navigator.clipboard.writeText(contenido)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
        📋 Copiar
      </button>
      <button onClick={imprimirDoc}
        className="flex items-center gap-2 px-4 py-2 border border-indigo-300 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 transition">
        🖨️ Imprimir
      </button>
      <button onClick={descargarPDF} disabled={generando}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50">
        {generando ? "Generando PDF..." : "⬇️ Descargar PDF"}
      </button>
    </div>
  );
}
