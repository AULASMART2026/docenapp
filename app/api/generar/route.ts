import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getPrompt(tipo: string, b: any): string {
  if (tipo === "rubrica") return "Eres un experto en educacion chilena segun el curriculum MINEDUC. Crea una rubrica de evaluacion detallada para: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Incluye criterios, niveles de logro (Excelente, Bueno, Suficiente, Insuficiente) y puntajes. Formato de tabla en texto plano.";
  if (tipo === "planificacion") return "Eres un experto en didactica chilena segun MINEDUC. Crea una planificacion de clase completa para: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Duracion: " + b.horas + " horas pedagogicas. Incluye: objetivo de aprendizaje, habilidades, inicio/desarrollo/cierre, recursos y evaluacion. Usa terminologia MINEDUC.";
  if (tipo === "evaluacion") return "Eres un experto en evaluacion educativa chilena. Crea una " + b.tipoEval + " sobre: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Incluye instrucciones, preguntas variadas (seleccion multiple, desarrollo, terminos pareados) y puntaje total 100 puntos. Pauta de respuestas al final.";
  if (tipo === "presentacion") return `Eres un experto en educacion chilena. Crea una presentacion de clase de ${b.slides} diapositivas sobre "${b.tema}" para ${b.nivel} en ${b.asignatura}.

Responde UNICAMENTE con un JSON valido con esta estructura exacta, sin texto adicional, sin markdown, sin explicaciones:
{"slides":[{"titulo":"Titulo de la diapositiva","contenido":"Contenido detallado","esBullet":true}]}

Reglas:
- La primera diapositiva es la portada con titulo atractivo
- Incluye: portada, objetivos, contenido principal (varias slides), actividad practica, evaluacion, cierre
- Cada slide debe tener contenido educativo real y util para el profesor
- esBullet es true cuando el contenido son puntos separados por salto de linea
- El contenido de cada slide maximo 150 palabras
- Total: exactamente ${b.slides} slides`;
  if (tipo === "pie") {
    const base = "Eres un especialista en educacion diferencial chilena experto en el Decreto 170 del MINEDUC. Estudiante: " + b.nombre + ", curso: " + b.curso + ", NEE: " + b.necesidad + ". ";
    if (b.tipoPIE === "informe_direccion") return base + "Redacta Informe PIE para Direccion con antecedentes, NEE, apoyos, logros y proyecciones.";
    if (b.tipoPIE === "informe_familia") return base + "Redacta Informe para Familia en lenguaje simple con NEE, apoyos, avances y recomendaciones para el hogar.";
    if (b.tipoPIE === "informe_fonoaudiologico") return base + "Redacta Informe Fonoaudiologico con evaluacion del lenguaje, diagnostico y recomendaciones.";
    if (b.tipoPIE === "informe_psicologico") return base + "Redacta Informe Psicologico con evaluacion por areas, diagnostico y recomendaciones.";
    if (b.tipoPIE === "informe_psicopedagogico") return base + "Redacta Informe Psicopedagogico con evaluacion de aprendizaje, perfil y sugerencias.";
    if (b.tipoPIE === "plan_intervencion_fonoaudiologico") return base + "Redacta Plan de Intervencion Fonoaudiologico semestral.";
    if (b.tipoPIE === "plan_intervencion_psicologico") return base + "Redacta Plan de Intervencion Psicologico semestral.";
    if (b.tipoPIE === "plan_intervencion_psicopedagogico") return base + "Redacta Plan de Intervencion Psicopedagogico semestral.";
    if (b.tipoPIE === "adecuacion") return base + "Redacta Adecuacion Curricular Individual segun MINEDUC.";
    if (b.tipoPIE === "paci") return base + "Redacta PACI completo segun formato oficial MINEDUC.";
    if (b.tipoPIE === "estrategias") return base + "Redacta Estrategias de Apoyo en Aula.";
    return base + "Redacta documento PIE profesional.";
  }
  if (tipo === "psicologia") {
    const base = "Eres psicologo escolar experto en normativa MINEDUC y MINSAL Chile. Estudiante: " + b.nombre + ", curso: " + b.curso + ". Motivo: " + b.motivo + ". ";
    if (b.tipoPSI === "informe_psicologico") return base + "Redacta Informe de Evaluacion Psicologica completo.";
    if (b.tipoPSI === "informe_socioemocional") return base + "Redacta Informe de Evaluacion Socioemocional.";
    if (b.tipoPSI === "informe_screening") return base + "Redacta Informe de Screening de Salud Mental.";
    if (b.tipoPSI === "pauta_observacion") return base + "Redacta Pauta de Observacion Conductual en Aula.";
    if (b.tipoPSI === "registro_entrevista_apoderado") return base + "Redacta Registro de Entrevista con Apoderado.";
    if (b.tipoPSI === "registro_entrevista_estudiante") return base + "Redacta Registro de Entrevista con Estudiante.";
    if (b.tipoPSI === "protocolo_crisis") return base + "Redacta Protocolo ante Crisis Emocional.";
    if (b.tipoPSI === "protocolo_suicida") return base + "Redacta Protocolo ante Conducta Suicida segun MINSAL.";
    if (b.tipoPSI === "protocolo_violencia") return base + "Redacta Protocolo ante Violencia Escolar segun Ley 20.536.";
    if (b.tipoPSI === "protocolo_vulneracion") return base + "Redacta Protocolo ante Vulneracion de Derechos.";
    if (b.tipoPSI === "protocolo_sustancias") return base + "Redacta Protocolo ante Consumo de Sustancias.";
    if (b.tipoPSI === "protocolo_bullying") return base + "Redacta Protocolo ante Bullying segun Ley 20.536.";
    if (b.tipoPSI === "plan_intervencion") return base + "Redacta Plan de Intervencion Psicologica Individual.";
    if (b.tipoPSI === "plan_socioemocional") return base + "Redacta Plan de Apoyo Socioemocional.";
    if (b.tipoPSI === "plan_convivencia") return base + "Redacta Plan de Convivencia Escolar segun MINEDUC.";
    if (b.tipoPSI === "programa_hse") return base + "Redacta Programa de Habilidades Socioemocionales.";
    if (b.tipoPSI === "plan_familias") return base + "Redacta Plan de Trabajo con Familias en Riesgo.";
    if (b.tipoPSI === "informe_tribunal") return base + "Redacta Informe Psicologico para Tribunal de Familia.";
    if (b.tipoPSI === "informe_opd") return base + "Redacta Informe para OPD.";
    if (b.tipoPSI === "informe_derivacion") return base + "Redacta Informe de Derivacion a Salud Mental.";
    if (b.tipoPSI === "informe_seguimiento") return base + "Redacta Informe de Seguimiento de Caso.";
    if (b.tipoPSI === "reporte_gestion") return base + "Redacta Reporte de Gestion Psicologica Mensual.";
    if (b.tipoPSI === "informe_vocacional") return base + "Redacta Informe de Orientacion Vocacional.";
    if (b.tipoPSI === "pauta_vocacional") return base + "Redacta Pauta de Entrevista Vocacional.";
    if (b.tipoPSI === "plan_vocacional") return base + "Redacta Plan de Exploracion de Intereses y Aptitudes.";
    return base + "Redacta documento psicologico escolar profesional.";
  }
  if (tipo === "escaneo") {
    if (b.modo === "simce") return "Eres evaluador educacional chileno. Analiza esta prueba de " + b.nivel + " en " + b.asignatura + ". Corrige cada pregunta, indica correctas e incorrectas, asigna puntaje, calcula porcentaje de logro, indica nivel SIMCE (Insuficiente, Elemental, Adecuado, Sobresaliente) y entrega recomendaciones pedagogicas.";
    return "Transcribe y digitaliza este documento. Mantén la estructura original y presenta el texto limpio y ordenado.";
  }
  return "Genera un documento educativo profesional.";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo, base64, mediaType } = body;
    let messages: any[];

    if (tipo === "escaneo" && base64) {
      messages = [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: base64 } },
        { type: "text", text: getPrompt("escaneo", body) }
      ]}];
    } else {
      messages = [{ role: "user", content: getPrompt(tipo, body) }];
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages
    });

    const texto = response.content[0].type === "text" ? response.content[0].text : "";

    if (tipo === "presentacion") {
      try {
        const clean = texto.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        return NextResponse.json({ contenido: texto, slides: parsed.slides || [] });
      } catch {
        return NextResponse.json({ contenido: texto, slides: [] });
      }
    }

    return NextResponse.json({ contenido: texto });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ contenido: "Error al generar. Intenta nuevamente." }, { status: 500 });
  }
}
