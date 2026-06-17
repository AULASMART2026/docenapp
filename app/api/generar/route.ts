import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ASIGNATURAS = [
  "Lenguaje y Comunicacion",
  "Matematica",
  "Ciencias Naturales",
  "Historia Geografia y Ciencias Sociales",
  "Ingles",
  "Educacion Fisica y Salud",
  "Artes Visuales",
  "Musica",
  "Tecnologia",
  "Religion",
  "Orientacion",
  "Filosofia",
  "Quimica",
  "Fisica",
  "Biologia",
];

function getPrompt(tipo: string, b: any): string {
  if (tipo === "rubrica") return "Eres un experto en educacion chilena segun el curriculum MINEDUC. Crea una rubrica de evaluacion detallada para: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Incluye criterios, niveles de logro (Excelente, Bueno, Suficiente, Insuficiente) y puntajes. Formato de tabla en texto plano.";
  if (tipo === "planificacion") return "Eres un experto en didactica chilena segun MINEDUC. Crea una planificacion de clase completa para: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Duracion: " + b.horas + " horas pedagogicas. Incluye: objetivo de aprendizaje, habilidades, inicio/desarrollo/cierre, recursos y evaluacion. Usa terminologia MINEDUC.";
  if (tipo === "evaluacion") return "Eres un experto en evaluacion educativa chilena. Crea una " + b.tipoEval + " sobre: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Incluye instrucciones, preguntas variadas (seleccion multiple, desarrollo, terminos pareados) y puntaje total 100 puntos. Pauta de respuestas al final.";
  if (tipo === "pie") {
    const base = "Eres un especialista en educacion diferencial chilena experto en el Decreto 170 del MINEDUC y la normativa PIE vigente. El estudiante se llama " + b.nombre + ", cursa " + b.curso + " y presenta: " + b.necesidad + ". ";
    if (b.tipoPIE === "informe_direccion") return base + "Redacta un Informe PIE formal para la Direccion. Incluye: antecedentes, NEE, apoyos entregados, logros y proyecciones.";
    if (b.tipoPIE === "informe_familia") return base + "Redacta un Informe para la Familia segun Decreto 170 en lenguaje claro. Incluye: NEE en terminos simples, apoyos, avances y recomendaciones para el hogar.";
    if (b.tipoPIE === "informe_fonoaudiologico") return base + "Redacta un Informe Fonoaudiologico profesional. Incluye: evaluacion del lenguaje, diagnostico, conclusiones y recomendaciones.";
    if (b.tipoPIE === "informe_psicologico") return base + "Redacta un Informe Psicologico profesional. Incluye: evaluacion por areas, diagnostico, conclusiones y recomendaciones.";
    if (b.tipoPIE === "informe_psicopedagogico") return base + "Redacta un Informe Psicopedagogico. Incluye: evaluacion de aprendizaje, perfil, diagnostico y sugerencias pedagogicas.";
    if (b.tipoPIE === "plan_intervencion_fonoaudiologico") return base + "Redacta un Plan de Intervencion Fonoaudiologico semestral con objetivos, actividades, frecuencia y criterios de logro.";
    if (b.tipoPIE === "plan_intervencion_psicologico") return base + "Redacta un Plan de Intervencion Psicologico semestral con objetivos, estrategias, frecuencia e indicadores de logro.";
    if (b.tipoPIE === "plan_intervencion_psicopedagogico") return base + "Redacta un Plan de Intervencion Psicopedagogico semestral con objetivos, estrategias, materiales y criterios de evaluacion.";
    if (b.tipoPIE === "adecuacion") return base + "Redacta una Adecuacion Curricular Individual segun MINEDUC con objetivos priorizados, metodologia adaptada y evaluacion diferenciada.";
    if (b.tipoPIE === "paci") return base + "Redacta un PACI completo segun formato oficial MINEDUC con datos, equipo PIE, diagnostico, objetivos y estrategias.";
    if (b.tipoPIE === "estrategias") return base + "Redacta Estrategias de Apoyo en Aula con adecuaciones de acceso, curriculares, metodologicas y de evaluacion.";
    return base + "Redacta un documento PIE profesional segun normativa chilena.";
  }
  if (tipo === "psicologia") {
    const base = "Eres un psicologo escolar experto en normativa MINEDUC y MINSAL Chile. Estudiante: " + b.nombre + ", curso: " + b.curso + ". Motivo: " + b.motivo + ". ";
    if (b.tipoPSI === "informe_psicologico") return base + "Redacta un Informe de Evaluacion Psicologica Escolar completo con datos, tecnicas, resultados por area, diagnostico, conclusiones y recomendaciones.";
    if (b.tipoPSI === "informe_socioemocional") return base + "Redacta un Informe de Evaluacion Socioemocional con competencias evaluadas, resultados, fortalezas y recomendaciones.";
    if (b.tipoPSI === "informe_screening") return base + "Redacta un Informe de Screening de Salud Mental con instrumentos, resultados por dimension, nivel de riesgo y recomendaciones.";
    if (b.tipoPSI === "pauta_observacion") return base + "Redacta una Pauta de Observacion Conductual en Aula con conductas, frecuencia, contexto y recomendaciones para el docente.";
    if (b.tipoPSI === "registro_entrevista_apoderado") return base + "Redacta un Registro de Entrevista con Apoderado con participantes, motivo, antecedentes, compromisos y proximos pasos.";
    if (b.tipoPSI === "registro_entrevista_estudiante") return base + "Redacta un Registro de Entrevista con Estudiante con motivo, estado emocional, discurso, impresion clinica y plan de seguimiento.";
    if (b.tipoPSI === "protocolo_crisis") return base + "Redacta un Protocolo de Actuacion ante Crisis Emocional con identificacion, pasos de intervencion, red de apoyo y seguimiento.";
    if (b.tipoPSI === "protocolo_suicida") return base + "Redacta un Protocolo ante Conducta Suicida segun MINSAL Chile con deteccion, evaluacion de riesgo, intervencion, notificacion a familia y derivacion.";
    if (b.tipoPSI === "protocolo_violencia") return base + "Redacta un Protocolo ante Violencia Escolar segun Ley 20.536 con tipos, deteccion, denuncia, medidas y seguimiento.";
    if (b.tipoPSI === "protocolo_vulneracion") return base + "Redacta un Protocolo ante Vulneracion de Derechos con indicadores, pasos, denuncia a OPD o Fiscalia y proteccion.";
    if (b.tipoPSI === "protocolo_sustancias") return base + "Redacta un Protocolo ante Consumo de Sustancias con deteccion, entrevista, derivacion y seguimiento.";
    if (b.tipoPSI === "protocolo_bullying") return base + "Redacta un Protocolo ante Bullying segun Ley 20.536 con definicion, deteccion, investigacion, medidas y trabajo con familias.";
    if (b.tipoPSI === "plan_intervencion") return base + "Redacta un Plan de Intervencion Psicologica Individual semestral con objetivos, estrategias, frecuencia e indicadores de logro.";
    if (b.tipoPSI === "plan_socioemocional") return base + "Redacta un Plan de Apoyo Socioemocional con necesidades, objetivos, actividades, recursos y evaluacion.";
    if (b.tipoPSI === "plan_convivencia") return base + "Redacta un Plan de Convivencia Escolar segun politica MINEDUC con diagnostico, objetivos, estrategias y evaluacion.";
    if (b.tipoPSI === "programa_hse") return base + "Redacta un Programa de Habilidades Socioemocionales con sesiones de autoconocimiento, autorregulacion, empatia, habilidades sociales y toma de decisiones.";
    if (b.tipoPSI === "plan_familias") return base + "Redacta un Plan de Trabajo con Familias en Riesgo con diagnostico, objetivos, estrategias, red de apoyo y seguimiento.";
    if (b.tipoPSI === "informe_tribunal") return base + "Redacta un Informe Psicologico para Tribunal de Familia con metodologia, antecedentes, evaluacion, conclusiones y recomendaciones en formato legal.";
    if (b.tipoPSI === "informe_opd") return base + "Redacta un Informe para OPD con antecedentes, situacion actual, factores de riesgo y proteccion, intervenciones y recomendaciones.";
    if (b.tipoPSI === "informe_derivacion") return base + "Redacta un Informe de Derivacion a Salud Mental con motivo, antecedentes, observaciones clinicas, hipotesis diagnostica y urgencia.";
    if (b.tipoPSI === "informe_seguimiento") return base + "Redacta un Informe de Seguimiento de Caso con objetivos trabajados, avances, dificultades, estado actual y proximos pasos.";
    if (b.tipoPSI === "reporte_gestion") return base + "Redacta un Reporte de Gestion Psicologica Mensual con casos atendidos, intervenciones, derivaciones, talleres y proyecciones.";
    if (b.tipoPSI === "informe_vocacional") return base + "Redacta un Informe de Orientacion Vocacional con intereses, aptitudes, valores, carreras sugeridas y plan de accion.";
    if (b.tipoPSI === "pauta_vocacional") return base + "Redacta una Pauta de Entrevista Vocacional con preguntas sobre intereses, habilidades, expectativas e influencias familiares.";
    if (b.tipoPSI === "plan_vocacional") return base + "Redacta un Plan de Exploracion de Intereses y Aptitudes con instrumentos, actividades, recursos y cronograma.";
    return base + "Redacta un documento psicologico escolar profesional segun normativa chilena.";
  }
  if (tipo === "escaneo") {
    if (b.modo === "simce") return "Eres un experto evaluador educacional chileno. Analiza esta prueba respondida por un estudiante de " + b.nivel + " en la asignatura " + b.asignatura + ". Corrige cada pregunta, indica cuales estan correctas e incorrectas, asigna puntaje, calcula el porcentaje de logro, indica el nivel de desempeno segun estandares SIMCE (Insuficiente, Elemental, Adecuado, Sobresaliente) y entrega recomendaciones pedagogicas especificas para el docente.";
    return "Transcribe y digitaliza el contenido de este documento manuscrito o impreso. Mantén la estructura original, corrige errores ortograficos evidentes y presenta el texto limpio y ordenado.";
  }
  return "Genera un documento educativo profesional.";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo, base64, mediaType } = body;
    let messages: any[];
    if ((tipo === "escaneo") && base64) {
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
    const contenido = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ contenido });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ contenido: "Error al generar. Intenta nuevamente." }, { status: 500 });
  }
}
