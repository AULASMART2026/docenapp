import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

async function getImg(query: string, sig: number): Promise<string | null> {
  try {
    const res = await fetch("https://source.unsplash.com/960x540/?" + encodeURIComponent(query) + "&sig=" + sig, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return "data:" + (res.headers.get("content-type") || "image/jpeg") + ";base64," + Buffer.from(buf).toString("base64");
  } catch { return null; }
}

export async function POST(req: Request) {
  try {
    const { slides, tema, asignatura, nivel } = await req.json();
    const prs = new pptxgen();
    prs.layout = "LAYOUT_16x9";

    const imgs = await Promise.all(slides.map((_: any, i: number) => getImg(tema + " " + asignatura, i)));

    for (let i = 0; i < slides.length; i++) {
      const sl = slides[i];
      const s = prs.addSlide();
      const img = imgs[i];

      if (i === 0) {
        s.background = { color: "1E3A8A" };
        if (img) s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "0F172A", transparency: 40 }, line: { color: "0F172A", transparency: 40 } });
        s.addShape("rect", { x: 0, y: 4.6, w: 10, h: 2.9, fill: { color: "1E3A8A", transparency: 15 }, line: { color: "1E3A8A", transparency: 15 } });
        s.addShape("rect", { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: "7C3AED" }, line: { color: "7C3AED" } });
        s.addText("DocenApp", { x: 0.6, y: 0.2, w: 9, h: 0.4, fontSize: 10, color: "BFDBFE", align: "left" });
        s.addText(sl.titulo || tema, { x: 0.6, y: 0.9, w: 8.8, h: 3.2, fontSize: 40, bold: true, color: "FFFFFF", align: "left", valign: "middle" });
        s.addShape("rect", { x: 0.6, y: 4.5, w: 2, h: 0.06, fill: { color: "7C3AED" }, line: { color: "7C3AED" } });
        s.addText(asignatura, { x: 0.6, y: 4.75, w: 9, h: 0.6, fontSize: 18, bold: true, color: "FFFFFF", align: "left" });
        s.addText(nivel.toUpperCase(), { x: 0.6, y: 5.45, w: 9, h: 0.4, fontSize: 12, color: "BFDBFE", align: "left" });

      } else if (i === slides.length - 1) {
        s.background = { color: "1E3A8A" };
        if (img) s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "0F172A", transparency: 40 }, line: { color: "0F172A", transparency: 40 } });
        s.addShape("rect", { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: "059669" }, line: { color: "059669" } });
        s.addText("Conclusion", { x: 0.6, y: 0.7, w: 9, h: 0.5, fontSize: 13, color: "BFDBFE", align: "left" });
        s.addText(sl.titulo || "Cierre", { x: 0.6, y: 1.3, w: 9, h: 1.1, fontSize: 32, bold: true, color: "FFFFFF", align: "left" });
        s.addShape("roundRect", { x: 0.6, y: 2.8, w: 8.8, h: 3.5, fill: { color: "FFFFFF", transparency: 20 }, line: { color: "FFFFFF", transparency: 60 }, rectRadius: 0.15 });
        s.addText(sl.contenido || "", { x: 0.9, y: 3.0, w: 8.2, h: 3.1, fontSize: 15, color: "FFFFFF", align: "center", valign: "middle", wrap: true });
        s.addText("Gracias | DocenApp", { x: 0.5, y: 6.9, w: 9, h: 0.35, fontSize: 9, color: "BFDBFE", align: "center" });

      } else {
        s.background = { color: "F8FAFC" };
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 1.05, fill: { color: "1E3A8A" }, line: { color: "1E3A8A" } });
        s.addShape("rect", { x: 0, y: 0, w: 0.3, h: 1.05, fill: { color: "2563EB" }, line: { color: "2563EB" } });
        s.addText(sl.titulo || "", { x: 0.5, y: 0.12, w: 8, h: 0.8, fontSize: 20, bold: true, color: "FFFFFF", valign: "middle" });
        s.addText(i + "/" + (slides.length - 1), { x: 8.3, y: 0.25, w: 1.5, h: 0.55, fontSize: 11, color: "BFDBFE", align: "right" });
        s.addShape("rect", { x: 0, y: 7.1, w: 10, h: 0.4, fill: { color: "DBEAFE" }, line: { color: "DBEAFE" } });
        s.addText("DocenApp | " + asignatura, { x: 0.3, y: 7.18, w: 9.4, h: 0.22, fontSize: 8, color: "1E3A8A", align: "right" });

        if (img) {
          const derecha = i % 2 !== 0;
          const ix = derecha ? 5.85 : 0.25;
          const tx = derecha ? 0.4 : 4.2;
          s.addImage({ data: img, x: ix, y: 1.15, w: 3.9, h: 5.75, sizing: { type: "cover", w: 3.9, h: 5.75 } });
          s.addShape("rect", { x: ix, y: 1.15, w: 3.9, h: 5.75, fill: { color: "1E3A8A", transparency: 80 }, line: { color: "1E3A8A", transparency: 80 } });
          s.addShape("rect", { x: tx - 0.05, y: 1.15, w: 5.45, h: 5.75, fill: { color: "F1F5F9" }, line: { color: "F1F5F9" } });
          const lineas = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          s.addText(lineas.map((l: string) => ({ text: l, options: { fontSize: 13, color: "0F172A", breakLine: true, paraSpaceAfter: 10, bullet: { indent: 15 } } })), { x: tx + 0.1, y: 1.3, w: 5.2, h: 5.4, valign: "top", wrap: true });
        } else {
          s.addShape("rect", { x: 0.3, y: 1.15, w: 9.4, h: 5.75, fill: { color: "F1F5F9" }, line: { color: "F1F5F9" } });
          s.addShape("rect", { x: 0.3, y: 1.15, w: 0.12, h: 5.75, fill: { color: "2563EB" }, line: { color: "2563EB" } });
          const lineas = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          s.addText(lineas.map((l: string) => ({ text: l, options: { fontSize: 14, color: "0F172A", breakLine: true, paraSpaceAfter: 11, bullet: { indent: 15 } } })), { x: 0.6, y: 1.3, w: 9.0, h: 5.4, valign: "top", wrap: true });
        }
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