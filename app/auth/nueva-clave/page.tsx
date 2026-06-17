"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-client";
import { useRouter } from "next/navigation";

export default function NuevaClave() {
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleCambiar() {
    setLoading(true);
    await supabase.auth.updateUser({ password });
    setOk(true);
    setLoading(false);
    setTimeout(() => router.push("/auth/login"), 2000);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-indigo-800">Nueva contrasena</h1>
        </div>
        {ok && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">Contrasena actualizada. Redirigiendo...</div>}
        <div className="space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Nueva contrasena" />
          <button onClick={handleCambiar} disabled={loading || !password}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
            {loading ? "Guardando..." : "Cambiar contrasena"}
          </button>
        </div>
      </div>
    </main>
  );
}
