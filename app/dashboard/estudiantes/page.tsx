"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase-client";
import Link from "next/link";

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("estudiantes").select("*").eq("docente_id", user.id).order("nombre");
      setEstudiantes(data || []);
      setLoading(false);
    }
    cargar();
  }, []);

  const filtrados = estudiantes.filter(e => e.nombre.toLowerCase().includes(buscar.toLowerCase()) || (e.curso || "").toLowerCase().includes(buscar.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 Mis Estudiantes</h1>
          <p className="text-gray-500 text-sm">{estudiantes.length} estudiante{estudiantes.length !== 1 ? "s" : ""} registrado{estudiantes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/estudiantes/nuevo"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Nuevo estudiante
        </Link>
      </div>

      <div className="mb-4">
        <input value={buscar} onChange={(e) => setBuscar(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Buscar por nombre o curso..." />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-5xl mb-4">👤</div>
          <p className="text-gray-500">No hay estudiantes registrados aun</p>
          <Link href="/dashboard/estudiantes/nuevo" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            Agregar primer estudiante
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrados.map(e => (
            <Link key={e.id} href={"/dashboard/estudiantes/" + e.id}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition border border-transparent hover:border-indigo-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-800 text-lg">{e.nombre}</div>
                  <div className="text-sm text-gray-500 mt-1">{e.curso} {e.colegio ? "— " + e.colegio : ""}</div>
                  {e.diagnostico && <div className="text-xs text-indigo-600 mt-2 bg-indigo-50 px-2 py-1 rounded-full inline-block">{e.diagnostico}</div>}
                </div>
                <div className="text-2xl">👤</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
