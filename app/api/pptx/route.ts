import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

export async function POST(req: Request) {
  try {
    const { slides, tema, asignatura, nivel } = await req.json();
    const prs = new pptxgen();
    slides.forEach((slide: any, i: number) => {
      const s = prs.addSlide();
      if (i === 0) {
        s.background = { color: "4338CA" };
        s.addText(slide.titulo || tema, { x: 0.5, y: 1.5, w: 9, h: 1.5, fontSize: 32, bold: true, color: "FFFFFF", align: "center" });
        s.addText(asignatura + " nivel " + nivel, { x: 0.5, y: 3.2, w: 9, h: 0.6, fontSize: 16, color: "C7D2FE", align: "center" });
        s.addText("DocenApp", { x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 12, color: "A5B4FC", align: "center" });
      } else {
        s.background = { color: "FFFFFF" };
        s.addText(slide.titulo || "", { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 22, bold: true, color: "4338CA" });
        s.addText(slide.contenido || "", { x: 0.5, y: 1.3, w: 9, h: 3.2, fontSize: 14, color: "374151", valign: "top", wrap: true });
        s.addText(i + "/" + (slides.length - 1), { x: 8.5, y: 4.8, w: 1, h: 0.3, fontSize: 10, color: "9CA3AF", align: "right" });
      }
    });
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