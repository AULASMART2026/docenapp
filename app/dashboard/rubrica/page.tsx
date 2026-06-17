"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-client";

export default function Rubrica() {
  const [tema, setTema] = useState("");
  const [nivel, setNivel] = useState("basica");
  const [asignatura, setAsignatura] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function generar() {
    setLoading(true);
    setResultado("");
    const res = await fetch("/api/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "rubrica", tema, nivel, asignatura }),
    });
    const data = await res.json();
    setResultado(data.contenido);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("documentos").insert({ docente_id: user.id, tipo: "rubrica", titulo: tema, contenido: data.contenido });
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Generar Rubrica</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tema o actividad a evaluar</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Ej: Exposicion oral sobre el medio ambiente" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel educativo</label>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="prebásica">Prebásica</option>
              <option value="basica">Basica</option>
              <option value="media">Media</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <input value={asignatura} onChange={(e) => setAsignatura(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: Lenguaje" />
          </div>
        </div>
        <button onClick={generar} disabled={loading || !tema}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Generando..." : "Generar Rubrica con IA"}
        </button>
      </div>
      {resultado && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Resultado</h2>
            <button onClick={() => navigator.clipboard.writeText(resultado)} className="text-sm text-indigo-600 hover:underline">Copiar</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{resultado}</pre>
        </div>
      )}
    </div>
  );
}
