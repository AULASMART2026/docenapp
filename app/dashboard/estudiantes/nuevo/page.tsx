"use client";
import { useState } from "react";
import { createClient } from "../../../../lib/supabase-client";
import { useRouter } from "next/navigation";

export default function NuevoEstudiante() {
  const [form, setForm] = useState({
    nombre: "", rut: "", fecha_nacimiento: "", curso: "", colegio: "",
    jornada: "completa", apoderado: "", contacto_apoderado: "", diagnostico: "", profesionales: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function guardar() {
    if (!form.nombre || form.nombre.length < 3) { setError("Ingresa el nombre completo"); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase.from("estudiantes").insert({ ...form, docente_id: user.id });
    if (err) { setError("Error al guardar"); setLoading(false); return; }
    router.push("/dashboard/estudiantes");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">👤 Nuevo Estudiante</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        
        <div className="border-b pb-2 mb-2">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Datos personales</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input value={form.nombre} onChange={e => update("nombre", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Nombre y apellidos" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
            <input value={form.rut} onChange={e => update("rut", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="12.345.678-9" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <input type="date" value={form.fecha_nacimiento} onChange={e => update("fecha_nacimiento", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
            <select value={form.jornada} onChange={e => update("jornada", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="completa">Completa</option>
              <option value="manana">Manana</option>
              <option value="tarde">Tarde</option>
            </select>
          </div>
        </div>

        <div className="border-b pb-2 mb-2 mt-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Datos escolares</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
            <input value={form.curso} onChange={e => update("curso", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: 5 Basico A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colegio</label>
            <input value={form.colegio} onChange={e => update("colegio", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Nombre del establecimiento" />
          </div>
        </div>

        <div className="border-b pb-2 mb-2 mt-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Apoderado</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del apoderado</label>
            <input value={form.apoderado} onChange={e => update("apoderado", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Nombre completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
            <input value={form.contacto_apoderado} onChange={e => update("contacto_apoderado", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Telefono o correo" />
          </div>
        </div>

        <div className="border-b pb-2 mb-2 mt-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Informacion clinica</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostico</label>
          <input value={form.diagnostico} onChange={e => update("diagnostico", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Ej: TEA, TDAH, discapacidad intelectual leve" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profesionales que lo atienden</label>
          <input value={form.profesionales} onChange={e => update("profesionales", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Ej: Psicologo, Fonoaudiologo, Psicopedagogo" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={guardar} disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar estudiante"}
          </button>
        </div>
      </div>
    </div>
  );
}
