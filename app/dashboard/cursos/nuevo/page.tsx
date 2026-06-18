"use client";
import { useState } from "react";
import { createClient } from "../../../../lib/supabase-client";
import { useRouter } from "next/navigation";

export default function NuevoCurso() {
  const [nombre, setNombre] = useState("");
  const [nivel, setNivel] = useState("basica");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function guardar() {
    if (nombre.length < 2) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("cursos").insert({ nombre, nivel, docente_id: user.id });
    router.push("/dashboard/cursos");
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🏫 Nuevo Curso</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del curso</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Ej: 5 Basico A" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <select value={nivel} onChange={e => setNivel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="prebásica">Prebásica</option>
            <option value="basica">Basica</option>
            <option value="media">Media</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
          <button onClick={guardar} disabled={loading || nombre.length < 2}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Guardando..." : "Crear curso"}
          </button>
        </div>
      </div>
    </div>
  );
}