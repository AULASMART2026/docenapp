"use client";
import { useState, useRef } from "react";
import { createClient } from "../../../lib/supabase-client";
import ResultadoPDF from "../../../components/ui/ResultadoPDF";

export default function Escaneo() {
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [modo, setModo] = useState("transcribir");
  const [asignatura, setAsignatura] = useState("Lenguaje");
  const [nivel, setNivel] = useState("basica");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const limpiarTexto = (texto: string) => texto.replace(/\|/g, "").replace(/---+/g, "________________").replace(/\*\*(.*?)\*\*/g, "$1").replace(/#{1,6}\s/g, "").trim();

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
        body: JSON.stringify({ tipo: "escaneo", base64, mediaType, modo, asignatura, nivel }),
      });
      const data = await res.json();
      setResultado(data.contenido);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("documentos").insert({ docente_id: user.id, tipo: "escaneo", titulo: modo === "simce" ? "Correccion SIMCE - " + asignatura : "Documento escaneado", contenido: data.contenido });
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">📷 Escaneo de Documentos</h1>
      <p className="text-gray-500 text-sm mb-6">Transcribe documentos o corrige pruebas estilo SIMCE con IA</p>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Modo de escaneo</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setModo("transcribir")}
              className={"p-3 rounded-lg border-2 text-sm font-medium transition " + (modo === "transcribir" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-indigo-300")}>
              📄 Transcribir documento
            </button>
            <button onClick={() => setModo("simce")}
              className={"p-3 rounded-lg border-2 text-sm font-medium transition " + (modo === "simce" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-indigo-300")}>
              ✅ Corregir prueba SIMCE
            </button>
          </div>
        </div>

        {modo === "simce" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
              <select value={asignatura} onChange={(e) => setAsignatura(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option>Lenguaje</option>
                <option>Matematica</option>
                <option>Ciencias Naturales</option>
                <option>Historia y Geografia</option>
                <option>Ingles</option>
                <option>Educacion Fisica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select value={nivel} onChange={(e) => setNivel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="2basico">2 Basico</option>
                <option value="4basico">4 Basico</option>
                <option value="6basico">6 Basico</option>
                <option value="8basico">8 Basico</option>
                <option value="2medio">2 Medio</option>
              </select>
            </div>
          </div>
        )}

        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-indigo-300 rounded-xl p-10 text-center cursor-pointer hover:bg-indigo-50 transition">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <div>
              <div className="text-4xl mb-2">{modo === "simce" ? "📝" : "📎"}</div>
              <p className="text-gray-500">{modo === "simce" ? "Sube la foto de la prueba respondida" : "Sube una imagen o PDF del documento"}</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF</p>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" onChange={handleArchivo} className="hidden" />
        {loading && (
          <div className="text-center py-4">
            <div className="text-indigo-600 font-medium">{modo === "simce" ? "Corrigiendo prueba con IA..." : "Transcribiendo documento..."}</div>
            <p className="text-gray-400 text-sm mt-1">Esto puede tomar unos segundos</p>
          </div>
        )}
      </div>

      {resultado && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-gray-700">{modo === "simce" ? "Resultado de Correccion" : "Texto transcrito"}</h2>
            <ResultadoPDF contenido={limpiarTexto(resultado)} titulo={modo === "simce" ? "Correccion SIMCE - " + asignatura : "Documento escaneado"} />
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans mt-4">{limpiarTexto(resultado)}</pre>
        </div>
      )}
    </div>
  );
}
