import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

async function getImagenBase64(tema: string, asignatura: string, index: number): Promise<string | null> {
  try {
    const terminos = [tema, asignatura, "education", "school", "learning", "classroom"];
    const query = encodeURIComponent(terminos.slice(0, 2).join(" "));
    const url = `https://source.unsplash.com/800x450/?${query}&sig=${index}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const ct = res.headers.get("content-type") || "image/jpeg";
    return `data:${ct};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { slides, tema, asignatura, nivel } = await req.json();
    const prs = new pptxgen();
    prs.layout = "LAYOUT_16x9";

    const imagenes: (string | null)[] = [];
    for (let i = 0; i < slides.length; i++) {
      const img = await getImagenBase64(tema, asignatura, i);
      imagenes.push(img);
    }

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const s = prs.addSlide();
      const img = imagenes[i];

      if (i === 0) {
        if (img) {
          s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        }
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "1E1B4B", transparency: 45 }, line: { color: "1E1B4B", transparency: 45 } });
        s.addShape(prs.ShapeType.rect, { x: 0, y: 4.5, w: 10, h: 3, fill: { color: "4338CA", transparency: 20 }, line: { color: "4338CA", transparency: 20 } });
        s.addText("DocenApp", { x: 0.5, y: 0.3, w: 9, h: 0.4, fontSize: 10, color: "C7D2FE", align: "center" });
        s.addText(slide.titulo || tema, { x: 0.5, y: 1.2, w: 9, h: 2.8, fontSize: 38, bold: true, color: "FFFFFF", align: "center", valign: "middle", shadow: { type: "outer", color: "000000", blur: 8, offset: 4, angle: 45 } });
        s.addText(asignatura + "  |  " + nivel.toUpperCase(), { x: 0.5, y: 4.7, w: 9, h: 0.7, fontSize: 18, color: "E0E7FF", align: "center", bold: true });
        s.addShape(prs.ShapeType.rect, { x: 3.5, y: 5.5, w: 3, h: 0.05, fill: { color: "818CF8" }, line: { color: "818CF8" } });

      } else if (i === slides.length - 1) {
        if (img) {
          s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        }
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "312E81", transparency: 30 }, line: { color: "312E81", transparency: 30 } });
        s.addText("Conclusion", { x: 0.5, y: 1, w: 9, h: 0.7, fontSize: 16, color: "C7D2FE", align: "center", bold: false });
        s.addText(slide.titulo || "Cierre", { x: 0.5, y: 1.8, w: 9, h: 1.2, fontSize: 32, bold: true, color: "FFFFFF", align: "center" });
        s.addShape(prs.ShapeType.roundRect, { x: 1, y: 3.2, w: 8, h: 2.8, fill: { color: "FFFFFF", transparency: 15 }, line: { color: "FFFFFF", transparency: 50 }, rectRadius: 0.15 });
        s.addText(slide.contenido || "", { x: 1.3, y: 3.4, w: 7.4, h: 2.4, fontSize: 14, color: "FFFFFF", align: "center", valign: "middle", wrap: true });
        s.addText("Generado con DocenApp", { x: 0.5, y: 7, w: 9, h: 0.3, fontSize: 9, color: "A5B4FC", align: "center" });

      } else {
        const esDerecha = i % 2 === 0;
        s.background = { color: "F8FAFC" };
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: "4338CA" }, line: { color: "4338CA" } });
        s.addShape(prs.ShapeType.rect, { x: 0, y: 7.1, w: 10, h: 0.4, fill: { color: "E0E7FF" }, line: { color: "E0E7FF" } });
        s.addText(slide.titulo || "", { x: 0.35, y: 0.18, w: 7.5, h: 0.8, fontSize: 21, bold: true, color: "FFFFFF", valign: "middle" });
        s.addText(i + " / " + (slides.length - 1), { x: 8.2, y: 0.3, w: 1.6, h: 0.55, fontSize: 12, color: "C7D2FE", align: "right" });

        if (img) {
          const imgX = esDerecha ? 6.2 : 0.3;
          const textoX = esDerecha ? 0.3 : 4.2;
          s.addImage({ data: img, x: imgX, y: 1.3, w: 3.5, h: 2.6, sizing: { type: "cover", w: 3.5, h: 2.6 } });
          s.addShape(prs.ShapeType.roundRect, { x: imgX, y: 1.3, w: 3.5, h: 2.6, fill: { color: "4338CA", transparency: 90 }, line: { color: "6366F1", transparency: 60 }, rectRadius: 0.1 });
          const lineas = (slide.contenido || "").split("\n").filter((l: string) => l.trim());
          const bullets = lineas.map((l: string) => ({ text: "• " + l.trim(), options: { fontSize: 13, color: "1E1B4B", breakLine: true, paraSpaceAfter: 8 } }));
          s.addText(bullets.length ? bullets : [{ text: slide.contenido || "", options: { fontSize: 13, color: "1E1B4B", breakLine: false } }], { x: textoX, y: 1.3, w: 5.6, h: 5.4, valign: "top", wrap: true });
        } else {
          const lineas = (slide.contenido || "").split("\n").filter((l: string) => l.trim());
          const bullets = lineas.map((l: string) => ({ text: "• " + l.trim(), options: { fontSize: 14, color: "1E1B4B", breakLine: true, paraSpaceAfter: 10 } }));
          s.addText(bullets.length ? bullets : [{ text: slide.contenido || "", options: { fontSize: 14, color: "1E1B4B", breakLine: false } }], { x: 0.4, y: 1.3, w: 9.2, h: 5.5, valign: "top", wrap: true });
        }
        s.addText("DocenApp  |  " + asignatura, { x: 0.3, y: 7.15, w: 9.4, h: 0.25, fontSize: 8, color: "6366F1", align: "right" });
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