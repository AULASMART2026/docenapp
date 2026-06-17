"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-client";
import ResultadoPDF from "../../../components/ui/ResultadoPDF";

const ASIGNATURAS = ["Lenguaje y Comunicacion","Matematica","Ciencias Naturales","Historia Geografia y Ciencias Sociales","Ingles","Educacion Fisica y Salud","Artes Visuales","Musica","Tecnologia","Religion","Orientacion","Filosofia","Quimica","Fisica","Biologia"];
const TEMAS: Record<string, string[]> = {
  "Lenguaje y Comunicacion": ["Comprension lectora","Produccion escrita","Exposicion oral","Analisis literario","Ortografia"],
  "Matematica": ["Fracciones","Geometria","Algebra","Estadistica","Ecuaciones"],
  "Ciencias Naturales": ["Sistema solar","Celula","Ecosistemas","Cuerpo humano","Estados de la materia"],
  "Historia Geografia y Ciencias Sociales": ["Civilizaciones antiguas","Independencia de Chile","Geografia de Chile","Democracia","Derechos humanos"],
  "Ingles": ["Present tense","Past tense","Vocabulary","Reading comprehension","Writing"],
  "Educacion Fisica y Salud": ["Vida saludable","Deportes colectivos","Atletismo","Gimnasia","Alimentacion"],
  "Artes Visuales": ["Tecnicas de dibujo","Pintura","Historia del arte","Arte chileno"],
  "Musica": ["Ritmo y melodia","Instrumentos","Generos musicales","Musica chilena"],
  "Tecnologia": ["Programacion","Seguridad digital","Herramientas digitales","Robotica"],
  "Religion": ["Valores","Biblica","Etica","Convivencia"],
  "Orientacion": ["Autoconocimiento","Proyecto de vida","Habilidades sociales"],
  "Filosofia": ["Logica","Etica","Teoria del conocimiento"],
  "Quimica": ["Tabla periodica","Reacciones quimicas","Acidos y bases"],
  "Fisica": ["Cinematica","Dinamica","Electricidad","Ondas"],
  "Biologia": ["Genetica","Evolucion","Ecologia","Microbiologia"],
};

export default function Evaluacion() {
  const [tema, setTema] = useState("");
  const [nivel, setNivel] = useState("basica");
  const [asignatura, setAsignatura] = useState("Lenguaje y Comunicacion");
  const [tipo, setTipo] = useState("prueba");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const limpiarTexto = (texto: string) => texto.replace(/\|/g, "").replace(/---+/g, "________________").replace(/\*\*(.*?)\*\*/g, "$1").replace(/#{1,6}\s/g, "").trim();

  async function generar() {
    if (tema.length < 3) return;
    setLoading(true);
    setResultado("");
    const res = await fetch("/api/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "evaluacion", tema, nivel, asignatura, tipoEval: tipo }),
    });
    const data = await res.json();
    setResultado(data.contenido);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("documentos").insert({ docente_id: user.id, tipo: "evaluacion", titulo: tema, contenido: data.contenido });
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📝 Generar Evaluacion</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select value={asignatura} onChange={(e) => { setAsignatura(e.target.value); setTema(""); }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {ASIGNATURAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="prebásica">Prebásica</option>
              <option value="basica">Basica</option>
              <option value="media">Media</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de evaluacion</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="prueba">Prueba escrita</option>
            <option value="quiz">Quiz rapido</option>
            <option value="oral">Pauta oral</option>
            <option value="coev">Coevaluacion</option>
            <option value="autoev">Autoevaluacion</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tema a evaluar</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Escribe el tema o elige uno sugerido abajo" />
          {TEMAS[asignatura] && (
            <div className="flex flex-wrap gap-2 mt-2">
              {TEMAS[asignatura].map(t => (
                <button key={t} onClick={() => setTema(t)}
                  className={"px-3 py-1 rounded-full text-xs transition " + (tema === t ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100")}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={generar} disabled={loading || tema.length < 3}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Generando..." : "Generar Evaluacion con IA"}
        </button>
      </div>
      {resultado && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-gray-700">Resultado</h2>
            <ResultadoPDF contenido={limpiarTexto(resultado)} titulo={"Evaluacion - " + tema} />
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans mt-4">{limpiarTexto(resultado)}</pre>
        </div>
      )}
    </div>
  );
}
