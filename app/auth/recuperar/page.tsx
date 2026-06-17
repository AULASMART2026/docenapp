"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-client";
import Link from "next/link";

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleRecuperar() {
    setLoading(true);
    const redirectTo = window.location.origin + "/auth/nueva-clave";
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setOk(true);
    setLoading(false);
  }

  if (ok)
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-indigo-800 mb-2">Revisa tu correo</h2>
          <p className="text-gray-500">Te enviamos un enlace para restablecer tu contrasena.</p>
          <Link href="/auth/login" className="mt-4 inline-block text-indigo-600 hover:underline">Volver al login</Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-2xl font-bold text-indigo-800">Recuperar contrasena</h1>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="tu@correo.cl"
          />
          <button
            onClick={handleRecuperar}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link href="/auth/login" className="text-indigo-600 hover:underline text-sm">Volver al login</Link>
        </div>
      </div>
    </main>
  );
}
