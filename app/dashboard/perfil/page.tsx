"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase-client";
import { useRouter } from "next/navigation";

export default function Perfil() {
  const [nombre, setNombre] = useState("");
  const [asignatura, setAsignatura] = useState("");
  const [nivel, setNivel] = useState("");
  const [colegio, setColegio] = useState("");
  const [email, setEmail] = useState("");
  const [total, setTotal] = useState(0);
  const [fechaRegistro, setFechaRegistro] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      setFechaRegistro(new Date(user.created_at).toLocaleDateString("es-CL"));
      const { data } = await supabase.from("docentes").select("*").eq("id", user.id).single();
      if (data) { setNombre(data.nombre || ""); setAsignatura(data.asignatura || ""); setNivel(data.nivel || ""); setColegio(data.colegio || ""); }
      const { count } = await supabase.from("documentos").select("*", { count: "exact", head: true }).eq("docente_id", user.id);
      setTotal(count || 0);
    }
    cargar();
  }, []);

  async function guardar() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("docentes").update({ nombre, asignatura, nivel, colegio }).eq("id", user.id);
    setOk(true);
    setLoading(false);
    setTimeout(() => setOk(false), 3000);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">👤 Mi Perfil</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
        {ok && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">Perfil actualizado correctamente ✅</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
          <input value={email} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura principal</label>
            <input value={asignatura} onChange={(e) => setAsignatura(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: Matematica" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel que imparte</label>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">Seleccionar</option>
              <option value="prebásica">Prebásica</option>
              <option value="basica">Basica</option>
              <option value="media">Media</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del colegio</label>
          <input value={colegio} onChange={(e) => setColegio(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Ej: Escuela Rural de Llifen" />
        </div>
        <button onClick={guardar} disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Estadisticas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-indigo-700">{total}</div>
            <div className="text-sm text-gray-500 mt-1">Documentos generados</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-indigo-700">{fechaRegistro}</div>
            <div className="text-sm text-gray-500 mt-1">Fecha de registro</div>
          </div>
        </div>
      </div>
      <button onClick={cerrarSesion}
        className="w-full border border-red-300 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-50 transition">
        Cerrar sesion
      </button>
    </div>
  );
}
