import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const prompts: Record<string, (b: any) => string> = {
  rubrica: b => Eres un experto en educacion chilena segun el curriculum MINEDUC. Crea una rubrica de evaluacion detallada para: "". Nivel: . Asignatura: . Incluye criterios, niveles de logro (Excelente, Bueno, Suficiente, Insuficiente) y puntajes. Formato de tabla en texto plano.,
  planificacion: b => Eres un experto en didactica chilena segun MINEDUC. Crea una planificacion de clase completa para: "". Nivel: . Asignatura: . Duracion:  horas pedagogicas. Incluye: objetivo de aprendizaje, habilidades, inicio/desarrollo/cierre, recursos y evaluacion. Usa terminologia MINEDUC.,
  evaluacion: b => Eres un experto en evaluacion educativa chilena. Crea una  sobre: "". Nivel: . Asignatura: . Incluye instrucciones, preguntas variadas (seleccion multiple, desarrollo, terminos pareados) y puntaje total 100 puntos. Pauta de respuestas al final.,
  pie: b => Eres un especialista en educacion diferencial chilena. Redacta un documento PIE tipo "" para el estudiante , curso , con necesidad educativa especial: . Basa el documento en el Decreto 170 del MINEDUC y la normativa PIE vigente en Chile. Incluye todos los campos requeridos por la normativa.,
  escaneo: () => Transcribe y digitaliza el contenido de este documento manuscrito o impreso. Mantén la estructura original, corrige errores ortográficos evidentes y presenta el texto de forma limpia y ordenada.
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { tipo, base64, mediaType } = body

    let messages: any[]

    if (tipo === 'escaneo' && base64) {
      messages = [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: base64 } },
          { type: 'text', text: prompts.escaneo(body) }
        ]
      }]
    } else {
      messages = [{ role: 'user', content: prompts[tipo]?.(body) || 'Genera un documento educativo.' }]
    }

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages
    })

    const contenido = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ contenido })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ contenido: 'Error al generar. Intenta nuevamente.' }, { status: 500 })
  }
}
