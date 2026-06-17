import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getPrompt(tipo: string, b: any): string {
  if (tipo === "rubrica") return "Eres un experto en educacion chilena segun el curriculum MINEDUC. Crea una rubrica de evaluacion detallada para: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Incluye criterios, niveles de logro (Excelente, Bueno, Suficiente, Insuficiente) y puntajes. Formato de tabla en texto plano.";
  if (tipo === "planificacion") return "Eres un experto en didactica chilena segun MINEDUC. Crea una planificacion de clase completa para: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Duracion: " + b.horas + " horas pedagogicas. Incluye: objetivo de aprendizaje, habilidades, inicio/desarrollo/cierre, recursos y evaluacion. Usa terminologia MINEDUC.";
  if (tipo === "evaluacion") return "Eres un experto en evaluacion educativa chilena. Crea una " + b.tipoEval + " sobre: " + b.tema + ". Nivel: " + b.nivel + ". Asignatura: " + b.asignatura + ". Incluye instrucciones, preguntas variadas (seleccion multiple, desarrollo, terminos pareados) y puntaje total 100 puntos. Pauta de respuestas al final.";
  if (tipo === "pie") {
    const base = "Eres un especialista en educacion diferencial chilena experto en el Decreto 170 del MINEDUC y la normativa PIE vigente. El estudiante se llama " + b.nombre + ", cursa " + b.curso + " y presenta: " + b.necesidad + ". ";
    if (b.tipoPIE === "informe_direccion") return base + "Redacta un Informe PIE formal para la Direccion del establecimiento. Incluye: antecedentes del estudiante, descripcion de NEE, apoyos entregados, logros y proyecciones. Formato profesional.";
    if (b.tipoPIE === "informe_familia") return base + "Redacta un Informe para la Familia segun Decreto 170. Usa lenguaje claro y accesible. Incluye: descripcion de NEE en terminos simples, apoyos que recibe, avances observados, recomendaciones para el hogar.";
    if (b.tipoPIE === "informe_fonoaudiologico") return base + "Redacta un Informe Fonoaudiologico profesional. Incluye: motivo de consulta, evaluacion del lenguaje y comunicacion, diagnostico fonoaudiologico, conclusiones y recomendaciones.";
    if (b.tipoPIE === "informe_psicologico") return base + "Redacta un Informe Psicologico profesional. Incluye: motivo de evaluacion, resultados por area (cognitiva, emocional, conductual, social), diagnostico, conclusiones y recomendaciones.";
    if (b.tipoPIE === "informe_psicopedagogico") return base + "Redacta un Informe Psicopedagogico profesional. Incluye: evaluacion de aprendizaje (lectura, escritura, matematica), perfil de aprendizaje, diagnostico psicopedagogico, sugerencias pedagogicas.";
    if (b.tipoPIE === "plan_intervencion_fonoaudiologico") return base + "Redacta un Plan de Intervencion Fonoaudiologico semestral. Incluye: objetivos terapeuticos, actividades, frecuencia de sesiones, estrategias y criterios de logro.";
    if (b.tipoPIE === "plan_intervencion_psicologico") return base + "Redacta un Plan de Intervencion Psicologico semestral. Incluye: objetivos, estrategias, actividades, frecuencia e indicadores de logro.";
    if (b.tipoPIE === "plan_intervencion_psicopedagogico") return base + "Redacta un Plan de Intervencion Psicopedagogico semestral. Incluye: objetivos de aprendizaje priorizados, estrategias, materiales, frecuencia y criterios de evaluacion.";
    if (b.tipoPIE === "adecuacion") return base + "Redacta una Adecuacion Curricular Individual segun normativa MINEDUC. Incluye: asignaturas, objetivos priorizados, metodologia adaptada, evaluacion diferenciada y responsables.";
    if (b.tipoPIE === "paci") return base + "Redacta un Plan de Adecuacion Curricular Individual (PACI) completo segun formato oficial MINEDUC. Incluye: datos del estudiante, equipo PIE, diagnostico, objetivos por area, estrategias y evaluacion.";
    if (b.tipoPIE === "estrategias") return base + "Redacta un documento de Estrategias de Apoyo en Aula. Incluye: adecuaciones de acceso, adecuaciones curriculares, estrategias metodologicas diferenciadas y pautas de evaluacion adaptada.";
    return base + "Redacta un documento PIE profesional segun normativa chilena vigente.";
  }
  if (tipo === "psicologia") {
    const base = "Eres un psicologo escolar experto en normativa chilena MINEDUC y MINSAL. El estudiante se llama " + b.nombre + ", cursa " + b.curso + ". Motivo: " + b.motivo + ". ";
    if (b.tipoPSI === "informe_psicologico") return base + "Redacta un Informe de Evaluacion Psicologica Escolar completo y profesional. Incluye: datos del estudiante, motivo de evaluacion, tecnicas utilizadas, resultados por area (cognitiva, emocional, conductual, social), diagnostico, conclusiones y recomendaciones.";
    if (b.tipoPSI === "informe_socioemocional") return base + "Redacta un Informe de Evaluacion Socioemocional. Incluye: competencias socioemocionales evaluadas, resultados, areas de fortaleza y mejora, recomendaciones para el aula y la familia.";
    if (b.tipoPSI === "informe_screening") return base + "Redacta un Informe de Screening de Salud Mental Escolar. Incluye: instrumentos aplicados, resultados por dimension (ansiedad, depresion, conducta), nivel de riesgo y recomendaciones de derivacion.";
    if (b.tipoPSI === "pauta_observacion") return base + "Redacta una Pauta de Observacion Conductual en Aula detallada. Incluye: conductas observadas, frecuencia, contexto, antecedentes y consecuentes, y recomendaciones para el docente.";
    if (b.tipoPSI === "registro_entrevista_apoderado") return base + "Redacta un Registro de Entrevista con Apoderado. Incluye: fecha, participantes, motivo, antecedentes familiares relevantes, compromisos adquiridos y proximos pasos.";
    if (b.tipoPSI === "registro_entrevista_estudiante") return base + "Redacta un Registro de Entrevista Psicologica con Estudiante. Incluye: motivo de consulta, estado emocional observado, discurso del estudiante, impresion clinica y plan de seguimiento.";
    if (b.tipoPSI === "protocolo_crisis") return base + "Redacta un Protocolo de Actuacion ante Crisis Emocional segun normativa chilena. Incluye: identificacion de la crisis, pasos de intervencion inmediata, red de apoyo, registro y seguimiento.";
    if (b.tipoPSI === "protocolo_suicida") return base + "Redacta un Protocolo de Actuacion ante Conducta Suicida segun orientaciones MINSAL Chile. Incluye: deteccion, evaluacion de riesgo, intervencion inmediata, notificacion a familia, derivacion y seguimiento. Incluye enfasis en confidencialidad y trabajo en red.";
    if (b.tipoPSI === "protocolo_violencia") return base + "Redacta un Protocolo de Actuacion ante Violencia Escolar segun Ley 20.536 Chile. Incluye: tipos de violencia, deteccion, denuncia, medidas de proteccion, sanciones y seguimiento.";
    if (b.tipoPSI === "protocolo_vulneracion") return base + "Redacta un Protocolo ante Sospecha de Vulneracion de Derechos segun normativa chilena. Incluye: indicadores de alerta, pasos de actuacion, denuncia a organismos competentes (OPD, Fiscalia), registro y proteccion del estudiante.";
    if (b.tipoPSI === "protocolo_sustancias") return base + "Redacta un Protocolo de Actuacion ante Consumo de Sustancias en el establecimiento. Incluye: deteccion, entrevista con estudiante y familia, derivacion a tratamiento, medidas educativas y seguimiento.";
    if (b.tipoPSI === "protocolo_bullying") return base + "Redacta un Protocolo de Actuacion ante Acoso Escolar segun Ley 20.536. Incluye: definicion, deteccion, investigacion, medidas con agresor y victima, trabajo con familias y seguimiento.";
    if (b.tipoPSI === "plan_intervencion") return base + "Redacta un Plan de Intervencion Psicologica Individual semestral. Incluye: objetivos terapeuticos, estrategias de intervencion, frecuencia de sesiones, indicadores de logro y coordinacion con docentes y familia.";
    if (b.tipoPSI === "plan_socioemocional") return base + "Redacta un Plan de Apoyo Socioemocional. Incluye: necesidades identificadas, objetivos, actividades individuales y grupales, recursos, cronograma y evaluacion de impacto.";
    if (b.tipoPSI === "plan_convivencia") return base + "Redacta un Plan de Convivencia Escolar segun politica nacional de convivencia MINEDUC. Incluye: diagnostico, objetivos, estrategias de prevencion, normas, procedimientos ante conflictos y evaluacion.";
    if (b.tipoPSI === "programa_hse") return base + "Redacta un Programa de Habilidades Socioemocionales (HSE) para el curso. Incluye: objetivos, sesiones tematicas (autoconocimiento, autorregulacion, empatia, habilidades sociales, toma de decisiones), actividades y evaluacion.";
    if (b.tipoPSI === "plan_familias") return base + "Redacta un Plan de Trabajo con Familias en Riesgo Psicosocial. Incluye: diagnostico familiar, objetivos, estrategias de intervencion, red de apoyo intersectorial, cronograma y seguimiento.";
    if (b.tipoPSI === "informe_tribunal") return base + "Redacta un Informe Psicologico para Tribunal de Familia. Incluye: datos del perito, metodologia, antecedentes del caso, evaluacion psicologica, conclusiones y recomendaciones. Formato legal profesional.";
    if (b.tipoPSI === "informe_opd") return base + "Redacta un Informe para la Oficina de Proteccion de Derechos (OPD). Incluye: antecedentes del caso, situacion actual del estudiante, factores de riesgo y proteccion, intervenciones realizadas y recomendaciones.";
    if (b.tipoPSI === "informe_derivacion") return base + "Redacta un Informe de Derivacion a Salud Mental. Incluye: motivo de derivacion, antecedentes relevantes, observaciones clinicas, hipotesis diagnostica y urgencia de la atencion.";
    if (b.tipoPSI === "informe_seguimiento") return base + "Redacta un Informe de Seguimiento de Caso Psicologico. Incluye: objetivos trabajados, avances observados, dificultades encontradas, estado actual y proximos pasos.";
    if (b.tipoPSI === "reporte_gestion") return base + "Redacta un Reporte de Gestion Psicologica Mensual para la direccion del establecimiento. Incluye: casos atendidos por tipo, intervenciones realizadas, derivaciones, talleres, coordinaciones intersectoriales y proyecciones.";
    if (b.tipoPSI === "informe_vocacional") return base + "Redacta un Informe de Orientacion Vocacional. Incluye: intereses, aptitudes, valores y estilo de aprendizaje identificados, carreras y trayectorias sugeridas, y plan de accion.";
    if (b.tipoPSI === "pauta_vocacional") return base + "Redacta una Pauta de Entrevista de Orientacion Vocacional. Incluye: preguntas sobre intereses, habilidades, experiencias, expectativas, influencias familiares y proyeccion futura.";
    if (b.tipoPSI === "plan_vocacional") return base + "Redacta un Plan de Exploracion de Intereses y Aptitudes. Incluye: instrumentos de evaluacion sugeridos, actividades de exploracion, recursos informativos sobre carreras y cronograma de orientacion.";
    return base + "Redacta un documento psicologico escolar profesional segun normativa chilena vigente.";
  }
  return "Transcribe y digitaliza el contenido de este documento. Mantén la estructura original y presenta el texto limpio y ordenado.";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo, base64, mediaType } = body;
    let messages: any[];
    if (tipo === "escaneo" && base64) {
      messages = [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: base64 } },
        { type: "text", text: "Transcribe y digitaliza el contenido de este documento." }
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
