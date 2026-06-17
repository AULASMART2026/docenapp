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
    if (b.tipoPIE === "informe_familia") return base + "Redacta un Informe para la Familia segun Decreto 170. Usa lenguaje claro y accesible para los apoderados. Incluye: descripcion de NEE en terminos simples, apoyos que recibe, avances observados, recomendaciones para el hogar.";
    if (b.tipoPIE === "informe_fonoaudiologico") return base + "Redacta un Informe Fonoaudiologico profesional. Incluye: motivo de consulta, antecedentes relevantes, evaluacion del lenguaje y comunicacion, diagnostico fonoaudiologico, conclusiones y recomendaciones. Formato clinico profesional.";
    if (b.tipoPIE === "informe_psicologico") return base + "Redacta un Informe Psicologico profesional. Incluye: motivo de evaluacion, tecnicas e instrumentos utilizados, resultados por area (cognitiva, emocional, conductual, social), diagnostico, conclusiones y recomendaciones. Formato clinico profesional.";
    if (b.tipoPIE === "informe_psicopedagogico") return base + "Redacta un Informe Psicopedagogico profesional. Incluye: motivo de derivacion, antecedentes escolares, evaluacion de aprendizaje (lectura, escritura, matematica), perfil de aprendizaje, diagnostico psicopedagogico, sugerencias pedagogicas. Formato profesional.";
    if (b.tipoPIE === "plan_intervencion_fonoaudiologico") return base + "Redacta un Plan de Intervencion Fonoaudiologico semestral. Incluye: objetivos terapeuticos, actividades especificas, frecuencia de sesiones, estrategias, criterios de logro y seguimiento. Formato de plan profesional.";
    if (b.tipoPIE === "plan_intervencion_psicologico") return base + "Redacta un Plan de Intervencion Psicologico semestral. Incluye: objetivos de intervencion, estrategias psicologicas, actividades, frecuencia, indicadores de logro y coordinacion con la familia y docentes. Formato de plan profesional.";
    if (b.tipoPIE === "plan_intervencion_psicopedagogico") return base + "Redacta un Plan de Intervencion Psicopedagogico semestral. Incluye: objetivos de aprendizaje priorizados, estrategias de mediacion, materiales, frecuencia de apoyo, criterios de evaluacion y coordinacion con docentes. Formato de plan profesional.";
    if (b.tipoPIE === "adecuacion") return base + "Redacta una Adecuacion Curricular Individual. Incluye: asignaturas con adecuacion, objetivos priorizados, metodologia adaptada, evaluacion diferenciada y responsables. Segun normativa MINEDUC.";
    if (b.tipoPIE === "paci") return base + "Redacta un Plan de Adecuacion Curricular Individual (PACI) completo. Incluye: datos del estudiante, equipo PIE, diagnostico, objetivos por area, estrategias, evaluacion y firma de profesionales. Formato oficial MINEDUC.";
    if (b.tipoPIE === "estrategias") return base + "Redacta un documento de Estrategias de Apoyo en Aula para docentes. Incluye: adecuaciones de acceso, adecuaciones curriculares, estrategias metodologicas diferenciadas, materiales recomendados y pautas de evaluacion adaptada.";
    return base + "Redacta un documento PIE profesional segun normativa chilena vigente.";
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
