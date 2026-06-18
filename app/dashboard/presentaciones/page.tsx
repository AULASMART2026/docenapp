"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-client";
import ResultadoPDF from "../../../components/ui/ResultadoPDF";

const ASIGNATURAS = ["Lenguaje y Comunicacion","Matematica","Ciencias Naturales","Historia Geografia y Ciencias Sociales","Ingles","Educacion Fisica y Salud","Artes Visuales","Musica","Tecnologia","Religion","Orientacion","Filosofia","Quimica","Fisica","Biologia"];
const TEMAS: Record<string, string[]> = {"Lenguaje y Comunicacion":["Comprension lectora","Produccion escrita","Exposicion oral"],"Matematica":["Fracciones","Geometria","Algebra"],"Ciencias Naturales":["Sistema solar","Celula","Ecosistemas"],"Historia Geografia y Ciencias Sociales":["Civilizaciones antiguas","Independencia de Chile","Democracia"],"Ingles":["Present tense","Past tense","Vocabulary"],"Educacion Fisica y Salud":["Vida saludable","Deportes colectivos","Atletismo"],"Artes Visuales":["Tecnicas de dibujo","Pintura","Arte chileno"],"Musica":["Ritmo y melodia","Instrumentos","Musica chilena"],"Tecnologia":["Programacion","Seguridad digital","Robotica"],"Religion":["Valores","Etica","Convivencia"],"Orientacion":["Autoconocimiento","Proyecto de vida"],"Filosofia":["Logica","Etica"],"Quimica":["Tabla periodica","Reacciones quimicas"],"Fisica":["Cinematica","Electricidad"],"Biologia":["Genetica","Ecologia"]};

export default function Presentaciones() {
  const [tema, setTema] = useState("");
  const [asignatura, setAsignatura] = useState("Lenguaje y Comunicacion");
  const [nivel, setNivel] = useState("basica");
  const [slides, setSlides] = useState("8");
  const [resultado, setResultado] = useState("");
  const [contenidoSlides, setContenidoSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generandoPPT, setGenerandoPPT] = useState(false);
  const supabase = createClient();
  const limpiarTexto = (texto: string) => texto.replace(/[|]/g, "").replace(/[-]{3,}/g, "___").trim();

  async function generar() {
    if (tema.length < 3) return;
    setLoading(true);
    setResultado("");
    setContenidoSlides([]);
    const res = await fetch("/api/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "presentacion", tema, asignatura, nivel, slides }),
    });
    const data = await res.json();
    setResultado(data.contenido);
    if (data.slides) setContenidoSlides(data.slides);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("documentos").insert({ docente_id: user.id, tipo: "presentacion", titulo: tema, contenido: data.contenido });
    setLoading(false);
  }

  async function descargarPPT() {
    if (!contenidoSlides.length) return;
    setGenerandoPPT(true);
    const res = await fetch("/api/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides: contenidoSlides, tema, asignatura, nivel }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tema.replace(/ /g, "_") + ".pptx";
    a.click();
    URL.revokeObjectURL(url);
    setGenerandoPPT(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Generar Presentacion</h1>
      <p className="text-gray-500 text-sm mb-6">Crea presentaciones de clases listas para PowerPoint</p>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select value={asignatura} onChange={(e) => { setAsignatura(e.target.value); setTema(""); }} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {ASIGNATURAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="prebásica">Prebásica</option>
              <option value="basica">Basica</option>
              <option value="media">Media</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Escribe el tema o elige uno sugerido" />
          {TEMAS[asignatura] && (
            <div className="flex flex-wrap gap-2 mt-2">
              {TEMAS[asignatura].map(t => (
                <button key={t} onClick={() => setTema(t)} className={"px-3 py-1 rounded-full text-xs transition " + (tema === t ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100")}>{t}</button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numero de diapositivas</label>
          <select value={slides} onChange={(e) => setSlides(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="6">6 diapositivas</option>
            <option value="8">8 diapositivas</option>
            <option value="10">10 diapositivas</option>
            <option value="12">12 diapositivas</option>
          </select>
        </div>
        <button onClick={generar} disabled={loading || tema.length < 3} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Generando..." : "Generar Presentacion con IA"}
        </button>
      </div>
      {resultado && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <ResultadoPDF contenido={limpiarTexto(resultado)} titulo={"Presentacion - " + tema} />
            {contenidoSlides.length > 0 && (
              <button onClick={descargarPPT} disabled={generandoPPT} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {generandoPPT ? "Generando .pptx..." : "Descargar PowerPoint"}
              </button>
            )}
          </div>
          {contenidoSlides.length > 0 ? (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-700">Vista previa</h2>
              {contenidoSlides.map((slide: any, i: number) => (
                <div key={i} className={"rounded-xl p-5 " + (i === 0 ? "bg-indigo-700" : "bg-white shadow-sm border border-gray-100")}>
                  <div className={"text-xs mb-2 " + (i === 0 ? "text-indigo-200" : "text-gray-400")}>{i === 0 ? "Portada" : "Diapositiva " + i}</div>
                  <div className={"font-bold text-lg mb-2 " + (i === 0 ? "text-white" : "text-indigo-700")}>{slide.titulo}</div>
                  <div className={"text-sm whitespace-pre-wrap " + (i === 0 ? "text-indigo-100" : "text-gray-600")}>{slide.contenido}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{limpiarTexto(resultado)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}