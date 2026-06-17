"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase-client";
import Link from "next/link";

export default function Dashboard() {
  const [nombre, setNombre] = useState("");
  const [total, setTotal] = useState(0);
  const [porTipo, setPorTipo] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: docente } = await supabase.from("docentes").select("nombre").eq("id", user.id).single();
      if (docente?.nombre) setNombre(docente.nombre);
      const { data: docs } = await supabase.from("documentos").select("tipo").eq("docente_id", user.id);
      if (docs) {
        setTotal(docs.length);
        const conteo = {};
        docs.forEach((d) => { conteo[d.tipo] = (conteo[d.tipo] || 0) + 1; });
        setPorTipo(Object.entries(conteo).map(([tipo, count]) => ({ tipo, count })));
      }
    }
    cargar();
  }, []);

  const modulos = [
    { href: "/dashboard/rubrica", icon: "📋", label: "Rubricas", desc: "Crea rubricas de evaluacion" },
    { href: "/dashboard/planificacion", icon: "📅", label: "Planificaciones", desc: "Planifica tus clases" },
    { href: "/dashboard/evaluacion", icon: "📝", label: "Evaluaciones", desc: "Genera pruebas y quizzes" },
    { href: "/dashboard/pie", icon: "♿", label: "Informes PIE", desc: "Documentos Decreto 170" },
    { href: "/dashboard/escaneo", icon: "📷", label: "Escaneo", desc: "Digitaliza documentos" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Hola{nombre ? ", " + nombre : ""} 👋
        </h1>
        <p className="text-gray-500">Tienes {total} documento{total !== 1 ? "s" : ""} generado{total !== 1 ? "s" : ""}.</p>
      </div>
      {porTipo.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="font-semibold text-gray-700 mb-4">Tus documentos por tipo</h2>
          <div className="space-y-2">
            {porTipo.map(({ tipo, count }) => (
              <div key={tipo} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-28 capitalize">{tipo}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div className="bg-indigo-500 h-4 rounded-full" style={{ width: Math.min((count / total) * 100, 100) + "%" }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modulos.map((m) => (
          <Link key={m.href} href={m.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition hover:border-indigo-300 border border-transparent">
            <div className="text-3xl mb-2">{m.icon}</div>
            <div className="font-semibold text-gray-800">{m.label}</div>
            <div className="text-sm text-gray-500 mt-1">{m.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
