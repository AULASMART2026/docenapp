import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getPrompt(tipo, b) {
  if (tipo === "rubrica") return "Eres un experto en educacion chilena segun el curriculum MINEDUC. Crea una rubrica de evaluacion detallada para: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Incluye criterios, niveles de logro (Excelente, Bueno, Suficiente, Insuficiente) y puntajes. Formato de tabla en texto plano.";
  if (tipo === "planificacion") return "Eres un experto en didactica chilena segun MINEDUC. Crea una planificacion de clase completa para: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Duracion: " + b.horas + " horas pedagogicas. Incluye: objetivo de aprendizaje, habilidades, inicio/desarrollo/cierre, recursos y evaluacion. Usa terminologia MINEDUC.";
  if (tipo === "evaluacion") return "Eres un experto en evaluacion educativa chilena. Crea una " + b.tipoEval + " sobre: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Incluye instrucciones, preguntas variadas (seleccion multiple, desarrollo, terminos pareados) y puntaje total 100 puntos. Pauta de respuestas al final.";
  if (tipo === "pie") return "Eres un especialista en educacion diferencial chilena. Redacta un documento PIE tipo " + b.tipoPIE + " para el estudiante " + b.nombre + ", curso " + b.curso + ", con necesidad educativa especial: " + b.necesidad + ". Basa el documento en el Decreto 170 del MINEDUC y la normativa PIE vigente en Chile. Incluye todos los campos requeridos por la normativa.";
  return "Transcribe y digitaliza el contenido de este documento. Mantén la estructura original y presenta el texto limpio y ordenado.";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { tipo, base64, mediaType } = body;
    let messages;
    if (tipo === "escaneo" && base64) {
      messages = [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: base64 } },
          { type: "text", text: getPrompt("escaneo", body) }
        ]
      }];
    } else {
      messages = [{ role: "user", content: getPrompt(tipo, body) }];
    }
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages
    });
    const contenido = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ contenido });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ contenido: "Error al generar. Intenta nuevamente." }, { status: 500 });
  }
}
