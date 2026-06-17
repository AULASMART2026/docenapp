'use client'
import { useState } from 'react'
import { createClient } from '../../../lib/supabase-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos')
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md'>
        <div className='text-center mb-6'>
          <div className='text-4xl mb-2'>📚</div>
          <h1 className='text-2xl font-bold text-indigo-800'>DocenApp</h1>
          <p className='text-gray-500 text-sm'>Inicia sesion en tu cuenta</p>
        </div>
        {error && <div className='bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm'>{error}</div>}
        <div className='space-y-4'>
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
              placeholder='••••••••' />
          </div>
          <button onClick={handleLogin} disabled={loading}
            className='w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50'>
            {loading ? 'Ingresando...' : 'Iniciar sesion'}
          </button>
        </div>
        <div className='mt-4 text-center text-sm text-gray-500'>
          <Link href='/auth/recuperar' className='text-indigo-600 hover:underline'>Olvide mi contrasena</Link>
          <span className='mx-2'>·</span>
          <Link href='/auth/registro' className='text-indigo-600 hover:underline'>Crear cuenta</Link>
        </div>
      </div>
    </main>
  )
}
