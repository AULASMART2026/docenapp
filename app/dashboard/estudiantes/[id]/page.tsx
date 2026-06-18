"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase-client";
import { useRouter, useParams } from "next/navigation";
import ResultadoPDF from "../../../../components/ui/ResultadoPDF";
import Link from "next/link";

export default function FichaEstudiante() {
  const [estudiante, setEstudiante] = useState<any>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>({});
  const [nuevoRegistro, setNuevoRegistro] = useState({ lenguaje: 4, matematica: 4, socioemocional: 4, conducta: 4, autonomia: 4, ciencias: 4, observaciones: "" });
  const [guardandoRegistro, setGuardandoRegistro] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    async function cargar() {
      const { data: est } = await supabase.from("estudiantes").select("*").eq("id", id).single();
      setEstudiante(est);
      setForm(est || {});
      const { data: regs } = await supabase.from("registros_aprendizaje").select("*").eq("estudiante_id", id).order("fecha", { ascending: false });
      setRegistros(regs || []);
      setLoading(false);
    }
    cargar();
  }, [id]);

  async function guardarEdicion() {
    await supabase.from("estudiantes").update(form).eq("id", id);
    setEstudiante(form);
    setEditando(false);
  }

  async function agregarRegistro() {
    setGuardandoRegistro(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("registros_aprendizaje").insert({ ...nuevoRegistro, estudiante_id: id, docente_id: user.id }).select().single();
    if (data) setRegistros([data, ...registros]);
    setGuardandoRegistro(false);
  }

  async function eliminar() {
    if (!confirm("Eliminar este estudiante?")) return;
    await supabase.from("estudiantes").delete().eq("id", id);
    router.push("/dashboard/estudiantes");
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>;
  if (!estudiante) return <div className="text-center py-12 text-gray-400">Estudiante no encontrado</div>;

  const areas = [
    { key: "lenguaje", label: "Lenguaje", color: "bg-blue-500" },
    { key: "matematica", label: "Matematica", color: "bg-green-500" },
    { key: "ciencias", label: "Ciencias", color: "bg-yellow-500" },
    { key: "socioemocional", label: "Socioemocional", color: "bg-purple-500" },
    { key: "conducta", label: "Conducta", color: "bg-red-500" },
    { key: "autonomia", label: "Autonomia", color: "bg-indigo-500" },
  ];

  const promedios = areas.map(a => {
    const vals = registros.map((r: any) => r[a.key]).filter((v: number) => v > 0);
    return { ...a, promedio: vals.length ? vals.reduce((s: number, v: number) => s + v, 0) / vals.length : 0 };
  });

  const fortalezas = promedios.filter(a => a.promedio >= 5.5).sort((a, b) => b.promedio - a.promedio);
  const debilidades = promedios.filter(a => a.promedio < 5.5 && a.promedio > 0).sort((a, b) => a.promedio - b.promedio);
  const resumenPDF = "FICHA: " + estudiante.nombre + "\nCurso: " + (estudiante.curso || "-") + "\nRUT: " + (estudiante.rut || "-") + "\nDiagnostico: " + (estudiante.diagnostico || "-") + "\nApoderado: " + (estudiante.apoderado || "-") + "\n\nFORTALEZAS:\n" + fortalezas.map(f => f.label + ": " + f.promedio.toFixed(1)).join("\n") + "\n\nAREAS A MEJORAR:\n" + debilidades.map(d => d.label + ": " + d.promedio.toFixed(1)).join("\n");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <Link href="/dashboard/estudiantes" className="text-indigo-600 text-sm hover:underline">Volver</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{estudiante.nombre}</h1>
          <p className="text-gray-500 text-sm">{estudiante.curso} {estudiante.colegio ? "- " + estudiante.colegio : ""}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ResultadoPDF contenido={resumenPDF} titulo={"Ficha - " + estudiante.nombre} />
          <button onClick={() => setEditando(!editando)} className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg text-sm hover:bg-indigo-50">Editar</button>
          <button onClick={eliminar} className="px-4 py-2 border border-red-300 text-red-500 rounded-lg text-sm hover:bg-red-50">Eliminar</button>
        </div>
      </div>

      {editando && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Editar datos</h2>
          <div className="grid grid-cols-2 gap-4">
            {[["nombre","Nombre"],["rut","RUT"],["curso","Curso"],["colegio","Colegio"],["apoderado","Apoderado"],["contacto_apoderado","Contacto"],["diagnostico","Diagnostico"],["profesionales","Profesionales"]].map(([k,l]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                <input value={form[k] || ""} onChange={e => setForm({...form, [k]: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditando(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">Cancelar</button>
            <button onClick={guardarEdicion} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm">Guardar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[["RUT", estudiante.rut],["Diagnostico", estudiante.diagnostico],["Apoderado", estudiante.apoderado],["Contacto", estudiante.contacto_apoderado],["Jornada", estudiante.jornada],["Profesionales", estudiante.profesionales]].map(([l,v]) => v ? (
          <div key={l} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-400 uppercase tracking-wide">{l}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{v}</div>
          </div>
        ) : null)}
      </div>

      {registros.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Grafico de Aprendizaje</h2>
          <div className="space-y-3">
            {promedios.map(a => (
              <div key={a.key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-28">{a.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5">
                  <div className={"h-5 rounded-full " + a.color} style={{ width: (a.promedio / 7) * 100 + "%" }} />
                </div>
                <span className={"text-sm font-bold w-8 " + (a.promedio >= 5.5 ? "text-green-600" : a.promedio >= 4 ? "text-yellow-600" : "text-red-600")}>
                  {a.promedio > 0 ? a.promedio.toFixed(1) : "-"}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {fortalezas.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-700 text-sm mb-2">Fortalezas</h3>
                {fortalezas.map(f => <div key={f.key} className="text-sm text-green-600">{f.label}: {f.promedio.toFixed(1)}</div>)}
              </div>
            )}
            {debilidades.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-700 text-sm mb-2">Areas a mejorar</h3>
                {debilidades.map(d => <div key={d.key} className="text-sm text-red-600">{d.label}: {d.promedio.toFixed(1)}</div>)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Agregar Registro de Aprendizaje</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {areas.map(a => (
            <div key={a.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{a.label} (1-7)</label>
              <input type="number" min="1" max="7" step="0.1"
                value={nuevoRegistro[a.key as keyof typeof nuevoRegistro]}
                onChange={e => setNuevoRegistro({...nuevoRegistro, [a.key]: parseFloat(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea rows={2} value={nuevoRegistro.observaciones}
            onChange={e => setNuevoRegistro({...nuevoRegistro, observaciones: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Notas sobre el progreso del estudiante..." />
        </div>
        <button onClick={agregarRegistro} disabled={guardandoRegistro}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {guardandoRegistro ? "Guardando..." : "Guardar registro"}
        </button>
      </div>

      {registros.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Historial</h2>
          <div className="space-y-3">
            {registros.map((r: any) => (
              <div key={r.id} className="border border-gray-100 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-2">{new Date(r.fecha).toLocaleDateString("es-CL")}</div>
                <div className="flex flex-wrap gap-2">
                  {areas.map(a => (
                    <span key={a.key} className={"text-xs px-2 py-1 rounded-full " + (r[a.key] >= 5.5 ? "bg-green-100 text-green-700" : r[a.key] >= 4 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                      {a.label}: {r[a.key]}
                    </span>
                  ))}
                </div>
                {r.observaciones && <div className="text-sm text-gray-600 mt-2">{r.observaciones}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}