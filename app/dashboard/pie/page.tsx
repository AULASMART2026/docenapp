"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-client";

export default function PIE() {
  const [nombre, setNombre] = useState("");
  const [curso, setCurso] = useState("");
  const [necesidad, setNecesidad] = useState("");
  const [tipo, setTipo] = useState("adecuacion");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function generar() {
    setLoading(true);
    setResultado("");
    const res = await fetch("/api/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "pie", nombre, curso, necesidad, tipoPIE: tipo }),
    });
    const data = await res.json();
    setResultado(data.contenido);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("documentos").insert({ docente_id: user.id, tipo: "pie", titulo: "PIE - " + nombre, contenido: data.contenido });
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">♿ Documentos PIE</h1>
      <p className="text-gray-500 text-sm mb-6">Segun Decreto 170 MINEDUC — Programa de Integracion Escolar</p>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del estudiante</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Nombre completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
            <input value={curso} onChange={(e) => setCurso(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: 5 Basico A" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Necesidad educativa especial</label>
          <input value={necesidad} onChange={(e) => setNecesidad(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Ej: TEA, TDAH, discapacidad intelectual leve" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento PIE</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="adecuacion">Adecuacion Curricular</option>
            <option value="paci">Plan PACI</option>
            <option value="informe">Informe PIE para Direccion</option>
            <option value="estrategias">Estrategias de Apoyo en Aula</option>
          </select>
        </div>
        <button onClick={generar} disabled={loading || !nombre || !necesidad}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Generando..." : "Generar Documento PIE con IA"}
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
