"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase-client";
import Link from "next/link";

export default function Cursos() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: cs } = await supabase.from("cursos").select("*").eq("docente_id", user.id).order("nombre");
      setCursos(cs || []);
      const { data: es } = await supabase.from("estudiantes").select("*").eq("docente_id", user.id).order("nombre");
      setEstudiantes(es || []);
      setLoading(false);
    }
    cargar();
  }, []);

  async function eliminarCurso(id: string) {
    if (!confirm("Eliminar este curso?")) return;
    await supabase.from("cursos").delete().eq("id", id);
    setCursos(cursos.filter(c => c.id !== id));
    if (cursoSeleccionado === id) setCursoSeleccionado(null);
  }

  const alumnosCurso = cursoSeleccionado
    ? estudiantes.filter(e => e.curso_id === cursoSeleccionado)
    : estudiantes.filter(e => !e.curso_id);

  const cursoActual = cursos.find(c => c.id === cursoSeleccionado);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏫 Mis Cursos</h1>
          <p className="text-gray-500 text-sm">{cursos.length} curso{cursos.length !== 1 ? "s" : ""} registrado{cursos.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/cursos/nuevo" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Nuevo curso
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Cursos</h2>
          <div className="space-y-2">
            <button onClick={() => setCursoSeleccionado(null)}
              className={"w-full text-left px-4 py-3 rounded-xl text-sm transition " + (!cursoSeleccionado ? "bg-indigo-600 text-white" : "bg-white shadow-sm hover:shadow-md text-gray-700")}>
              <div className="font-semibold">Sin curso asignado</div>
              <div className={"text-xs mt-0.5 " + (!cursoSeleccionado ? "text-indigo-200" : "text-gray-400")}>
                {estudiantes.filter(e => !e.curso_id).length} estudiante{estudiantes.filter(e => !e.curso_id).length !== 1 ? "s" : ""}
              </div>
            </button>
            {cursos.map(c => (
              <div key={c.id} className="relative">
                <button onClick={() => setCursoSeleccionado(c.id)}
                  className={"w-full text-left px-4 py-3 rounded-xl text-sm transition " + (cursoSeleccionado === c.id ? "bg-indigo-600 text-white" : "bg-white shadow-sm hover:shadow-md text-gray-700")}>
                  <div className="font-semibold">{c.nombre}</div>
                  <div className={"text-xs mt-0.5 " + (cursoSeleccionado === c.id ? "text-indigo-200" : "text-gray-400")}>
                    {c.nivel} — {estudiantes.filter(e => e.curso_id === c.id).length} estudiante{estudiantes.filter(e => e.curso_id === c.id).length !== 1 ? "s" : ""}
                  </div>
                </button>
                <button onClick={() => eliminarCurso(c.id)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs px-1">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              {cursoActual ? cursoActual.nombre : "Sin curso asignado"}
            </h2>
            <Link href="/dashboard/estudiantes/nuevo" className="text-indigo-600 text-sm hover:underline">+ Agregar estudiante</Link>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Cargando...</div>
          ) : alumnosCurso.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-3">👤</div>
              <p className="text-gray-500 text-sm">No hay estudiantes en este curso</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {alumnosCurso.map(e => (
                <Link key={e.id} href={"/dashboard/estudiantes/id?id=" + e.id}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition border border-transparent hover:border-indigo-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{e.nombre}</div>
                    <div className="text-sm text-gray-500">{e.curso} {e.colegio ? "- " + e.colegio : ""}</div>
                    {e.diagnostico && <div className="text-xs text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">{e.diagnostico}</div>}
                  </div>
                  <div className="text-2xl">👤</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}