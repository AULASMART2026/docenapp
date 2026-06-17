"use client";
import { useState, useRef } from "react";
import { createClient } from "../../../lib/supabase-client";

export default function Escaneo() {
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResultado("");
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const mediaType = file.type;
      const res = await fetch("/api/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "escaneo", base64, mediaType }),
      });
      const data = await res.json();
      setResultado(data.contenido);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("documentos").insert({ docente_id: user.id, tipo: "escaneo", titulo: "Documento escaneado", contenido: data.contenido });
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">📷 Escaneo de Documentos</h1>
      <p className="text-gray-500 text-sm mb-6">Sube una foto o PDF de un documento manuscrito y la IA lo transcribe</p>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-indigo-300 rounded-xl p-10 text-center cursor-pointer hover:bg-indigo-50 transition">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <div>
              <div className="text-4xl mb-2">📎</div>
              <p className="text-gray-500">Haz clic para subir una imagen o PDF</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF</p>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" onChange={handleArchivo} className="hidden" />
        {loading && <p className="text-center text-indigo-600 mt-4 font-medium">Transcribiendo con IA...</p>}
      </div>
      {resultado && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Texto transcrito</h2>
            <button onClick={() => navigator.clipboard.writeText(resultado)} className="text-sm text-indigo-600 hover:underline">Copiar</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{resultado}</pre>
        </div>
      )}
    </div>
  );
}
