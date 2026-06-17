'use client'
import { useState } from 'react'
import { createClient } from '../../../lib/supabase-client'
import Link from 'next/link'

export default function Registro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleRegistro() {
    setLoading(true)
    setError('')
    const redirectTo = window.location.origin + '/api/auth/callback'
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre }, emailRedirectTo: redirectTo }
    })
    if (error) setError(error.message)
    else setOk(true)
    setLoading(false)
  }

  if (ok) return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center'>
        <div className='text-5xl mb-4'>📧</div>
        <h2 className='text-xl font-bold text-indigo-800 mb-2'>Revisa tu correo</h2>
        <p className='text-gray-500'>Te enviamos un enlace de verificacion a <strong>{email}</strong></p>
      </div>
    </main>
  )

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md'>
        <div className='text-center mb-6'>
          <div className='text-4xl mb-2'>📚</div>
          <h1 className='text-2xl font-bold text-indigo-800'>Crear cuenta gratis</h1>
          <p className='text-gray-500 text-sm'>Para profesores chilenos</p>
        </div>
        {error && <div className='bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm'>{error}</div>}
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Nombre</label>
            <input type='text' value={nombre} onChange={e => setNombre(e.target.value)}
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400'
              placeholder='Tu nombre' />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Correo electronico</label>
            <input type='email' value={email} onChange={e => setEmail(e.target.value)}
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400'
              placeholder='tu@correo.cl' />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Contrasena</label>
            <input type='password' value={password} onChange={e => setPassword(e.target.value)}
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400'
              placeholder='Minimo 6 caracteres' />
          </div>
          <button onClick={handleRegistro} disabled={loading}
            className='w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50'>
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </div>
        <div className='mt-4 text-center text-sm text-gray-500'>
          Ya tienes cuenta? <Link href='/auth/login' className='text-indigo-600 hover:underline'>Inicia sesion</Link>
        </div>
      </div>
    </main>
  )
}
