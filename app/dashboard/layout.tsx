"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const links = [
    { href: "/dashboard", icon: "🏠", label: "Inicio" },
    { href: "/dashboard/cursos", icon: "🏫", label: "Cursos" },
    { href: "/dashboard/estudiantes", icon: "👥", label: "Estudiantes" },
    { href: "/dashboard/rubrica", icon: "📋", label: "Rubricas" },
    { href: "/dashboard/planificacion", icon: "📅", label: "Planificaciones" },
    { href: "/dashboard/evaluacion", icon: "📝", label: "Evaluaciones" },
    { href: "/dashboard/presentaciones", icon: "📊", label: "Presentaciones" },
    { href: "/dashboard/pie", icon: "♿", label: "PIE" },
    { href: "/dashboard/psicologia", icon: "🧠", label: "Psicologia" },
    { href: "/dashboard/escaneo", icon: "📷", label: "Escaneo" },
    { href: "/dashboard/perfil", icon: "👤", label: "Perfil" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-16 md:w-56 bg-indigo-800 text-white flex flex-col py-6 px-2 md:px-4 fixed h-full z-10 overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-2xl">📚</div>
          <div className="hidden md:block font-bold text-sm mt-1">DocenApp</div>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={"flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition " + (pathname === l.href ? "bg-indigo-600" : "hover:bg-indigo-700")}>
              <span>{l.icon}</span>
              <span className="hidden md:block">{l.label}</span>
            </Link>
          ))}
        </nav>
        <button onClick={cerrarSesion}
          className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm hover:bg-indigo-700 transition mt-4">
          <span>🚪</span>
          <span className="hidden md:block">Cerrar sesion</span>
        </button>
      </aside>
      <main className="flex-1 ml-16 md:ml-56 p-6">{children}</main>
    </div>
  );
}