"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-client";
import ResultadoPDF from "../../../components/ui/ResultadoPDF";

export default function Psicologia() {
  const [nombre, setNombre] = useState("");
  const [curso, setCurso] = useState("");
  const [motivo, setMotivo] = useState("");
  const [tipo, setTipo] = useState("informe_psicologico");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const limpiarTexto = (texto: string) => texto.replace(/\|/g, "").replace(/---+/g, "________________").replace(/\*\*(.*?)\*\*/g, "$1").replace(/#{1,6}\s/g, "").trim();

  async function generar() {
    if (nombre.length < 3) return;
    setLoading(true);
    setResultado("");
    const res = await fetch("/api/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "psicologia", nombre, curso, motivo, tipoPSI: tipo }),
    });
    const data = await res.json();
    setResultado(data.contenido);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("documentos").insert({ docente_id: user.id, tipo: "psicologia", titulo: "PSI - " + nombre, contenido: data.contenido });
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">🧠 Psicologia Escolar</h1>
      <p className="text-gray-500 text-sm mb-6">Documentos psicologicos segun normativa MINEDUC y MINSAL Chile</p>
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
              placeholder="Ej: 7 Basico B" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de consulta o situacion</label>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Ej: Estudiante presenta conductas disruptivas en aula, bajo rendimiento y aislamiento social..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <optgroup label="— Evaluaciones y Diagnostico —">
              <option value="informe_psicologico">📋 Informe de Evaluacion Psicologica</option>
              <option value="informe_socioemocional">❤️ Informe de Evaluacion Socioemocional</option>
              <option value="informe_screening">🔍 Informe de Screening de Salud Mental</option>
              <option value="pauta_observacion">👁️ Pauta de Observacion Conductual en Aula</option>
              <option value="registro_entrevista_apoderado">👨‍👩‍👧 Registro de Entrevista con Apoderado</option>
              <option value="registro_entrevista_estudiante">🧒 Registro de Entrevista con Estudiante</option>
            </optgroup>
            <optgroup label="— Protocolos de Actuacion —">
              <option value="protocolo_crisis">🚨 Protocolo ante Crisis Emocional</option>
              <option value="protocolo_suicida">⚠️ Protocolo ante Conducta Suicida (MINSAL)</option>
              <option value="protocolo_violencia">🛡️ Protocolo ante Violencia Escolar</option>
              <option value="protocolo_vulneracion">🔒 Protocolo ante Vulneracion de Derechos</option>
              <option value="protocolo_sustancias">🚫 Protocolo ante Consumo de Sustancias</option>
              <option value="protocolo_bullying">🤝 Protocolo ante Acoso Escolar (Bullying)</option>
            </optgroup>
            <optgroup label="— Planes e Intervenciones —">
              <option value="plan_intervencion">📝 Plan de Intervencion Psicologica Individual</option>
              <option value="plan_socioemocional">💚 Plan de Apoyo Socioemocional</option>
              <option value="plan_convivencia">🏫 Plan de Convivencia Escolar</option>
              <option value="programa_hse">🎯 Programa Habilidades Socioemocionales</option>
              <option value="plan_familias">👨‍👩‍👧‍👦 Plan de Trabajo con Familias en Riesgo</option>
            </optgroup>
            <optgroup label="— Informes y Reportes —">
              <option value="informe_tribunal">⚖️ Informe para Tribunal de Familia</option>
              <option value="informe_opd">🏢 Informe para OPD</option>
              <option value="informe_derivacion">🏥 Informe de Derivacion a Salud Mental</option>
              <option value="informe_seguimiento">📊 Informe de Seguimiento de Caso</option>
              <option value="reporte_gestion">📈 Reporte de Gestion Psicologica Mensual</option>
            </optgroup>
            <optgroup label="— Orientacion Vocacional —">
              <option value="informe_vocacional">🎓 Informe de Orientacion Vocacional</option>
              <option value="pauta_vocacional">📋 Pauta de Entrevista Vocacional</option>
              <option value="plan_vocacional">🗺️ Plan de Exploracion de Intereses y Aptitudes</option>
            </optgroup>
          </select>
        </div>
        <button onClick={generar} disabled={loading || nombre.length < 3}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Generando..." : "Generar Documento con IA"}
        </button>
      </div>
      {resultado && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-gray-700">Resultado</h2>
            <ResultadoPDF contenido={limpiarTexto(resultado)} titulo={"PSI - " + nombre} />
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans mt-4">{limpiarTexto(resultado)}</pre>
        </div>
      )}
    </div>
  );
}
