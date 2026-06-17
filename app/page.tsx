'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-4xl mx-auto px-4 py-16 text-center'>
        <div className='text-6xl mb-4'>📚</div>
        <h1 className='text-4xl font-bold text-indigo-800 mb-4'>DocenApp</h1>
        <p className='text-xl text-gray-600 mb-2'>Herramientas con IA para profesores chilenos</p>
        <p className='text-gray-500 mb-10'>Genera rubricas, planificaciones, evaluaciones e informes PIE en segundos. Gratis.</p>
        <div className='flex gap-4 justify-center mb-16'>
          <Link href='/auth/registro' className='bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition'>
            Comenzar gratis
          </Link>
          <Link href='/auth/login' className='border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition'>
            Iniciar sesion
          </Link>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[
            { icon: '📋', label: 'Rubricas' },
            { icon: '📅', label: 'Planificaciones' },
            { icon: '📝', label: 'Evaluaciones' },
            { icon: '♿', label: 'Informes PIE' },
          ].map(f => (
            <div key={f.label} className='bg-white rounded-xl p-6 shadow-sm'>
              <div className='text-3xl mb-2'>{f.icon}</div>
              <div className='font-semibold text-gray-700'>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
