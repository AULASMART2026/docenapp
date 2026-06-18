import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

const COLORES = {
  primario: "4338CA",
  secundario: "6366F1", 
  acento: "E0E7FF",
  texto: "1E1B4B",
  blanco: "FFFFFF",
  gris: "F8FAFC",
};

function getImagenTema(tema: string, asignatura: string): string {
  const termino = encodeURIComponent(tema + " " + asignatura + " education");
  return "https://source.unsplash.com/800x450/?" + termino;
}

export async function POST(req: Request) {
  try {
    const { slides, tema, asignatura, nivel } = await req.json();
    const prs = new pptxgen();
    prs.layout = "LAYOUT_16x9";

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const s = prs.addSlide();

      if (i === 0) {
        s.background = { color: COLORES.primario };
        s.addShape(prs.ShapeType.rect, { x: 0, y: 3.8, w: 10, h: 1.7, fill: { color: COLORES.secundario }, line: { color: COLORES.secundario } });
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.15, h: 7.5, fill: { color: "E0E7FF" }, line: { color: "E0E7FF" } });
        s.addShape(prs.ShapeType.rect, { x: 9.85, y: 0, w: 0.15, h: 7.5, fill: { color: "E0E7FF" }, line: { color: "E0E7FF" } });
        s.addText("DocenApp", { x: 0.4, y: 0.3, w: 9.2, h: 0.4, fontSize: 11, color: "A5B4FC", align: "center", bold: false });
        s.addText(slide.titulo || tema, { x: 0.4, y: 1.2, w: 9.2, h: 2.2, fontSize: 36, bold: true, color: COLORES.blanco, align: "center", valign: "middle" });
        s.addText(asignatura, { x: 0.4, y: 3.9, w: 9.2, h: 0.6, fontSize: 18, color: "E0E7FF", align: "center", bold: true });
        s.addText(nivel.toUpperCase(), { x: 0.4, y: 4.6, w: 9.2, h: 0.4, fontSize: 13, color: "C7D2FE", align: "center" });
        s.addText("Generado con DocenApp", { x: 0.4, y: 6.9, w: 9.2, h: 0.3, fontSize: 9, color: "818CF8", align: "center" });

      } else if (i === slides.length - 1) {
        s.background = { color: COLORES.primario };
        s.addShape(prs.ShapeType.rect, { x: 2, y: 2, w: 6, h: 4, fill: { color: COLORES.secundario }, line: { color: COLORES.secundario } });
        s.addText(slide.titulo || "Cierre", { x: 0.4, y: 2.2, w: 9.2, h: 1, fontSize: 28, bold: true, color: COLORES.blanco, align: "center" });
        s.addText(slide.contenido || "", { x: 2.2, y: 3.4, w: 5.6, h: 2, fontSize: 14, color: "E0E7FF", align: "center", valign: "middle", wrap: true });
        s.addText("Gracias", { x: 0.4, y: 6.5, w: 9.2, h: 0.6, fontSize: 22, bold: true, color: "A5B4FC", align: "center" });

      } else {
        s.background = { color: COLORES.gris };
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: COLORES.primario }, line: { color: COLORES.primario } });
        s.addShape(prs.ShapeType.rect, { x: 0, y: 7.0, w: 10, h: 0.5, fill: { color: COLORES.acento }, line: { color: COLORES.acento } });
        s.addText(slide.titulo || "", { x: 0.3, y: 0.15, w: 8, h: 0.8, fontSize: 20, bold: true, color: COLORES.blanco, valign: "middle" });
        s.addText(i + " / " + (slides.length - 1), { x: 8.3, y: 0.25, w: 1.5, h: 0.6, fontSize: 11, color: "A5B4FC", align: "right" });
        
        const lineas = (slide.contenido || "").split("\n").filter((l: string) => l.trim());
        if (lineas.length > 0) {
          const bullets = lineas.map((l: string) => ({ text: l.trim(), options: { bullet: { type: "bullet" }, fontSize: 14, color: COLORES.texto, breakLine: true, paraSpaceAfter: 6 } }));
          s.addText(bullets, { x: 0.4, y: 1.3, w: 9.2, h: 5.4, valign: "top", wrap: true });
        }
        s.addText("DocenApp | " + asignatura, { x: 0.3, y: 7.1, w: 9.4, h: 0.3, fontSize: 8, color: "6366F1", align: "right" });
      }
    }

    const buffer = await prs.write({ outputType: "nodebuffer" });
    return new NextResponse(buffer as Buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": "attachment; filename=presentacion.pptx",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error generando PPT" }, { status: 500 });
  }
}