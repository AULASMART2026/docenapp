import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getQueryIA(tema: string, titulo: string): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      messages: [{ role: "user", content: "Dame 3 palabras clave en español para buscar una imagen de: " + tema + " - " + titulo + ". Solo las palabras separadas por espacio." }]
    });
    return res.content[0].type === "text" ? res.content[0].text.trim() : tema;
  } catch { return tema; }
}

async function getImgGoogle(query: string, index: number): Promise<string | null> {
  try {
    const key = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;
    const start = (index % 5) + 1;
    const url = "https://www.googleapis.com/customsearch/v1?key=" + key + "&cx=" + cx + "&q=" + encodeURIComponent(query) + "&searchType=image&num=1&start=" + start + "&imgSize=large&safe=active";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    const imgUrl = data?.items?.[0]?.link;
    if (!imgUrl) return null;
    const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) });
    if (!imgRes.ok) return null;
    const buf = await imgRes.arrayBuffer();
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    if (!ct.startsWith("image/")) return null;
    return "data:" + ct + ";base64," + Buffer.from(buf).toString("base64");
  } catch { return null; }
}

export async function POST(req: Request) {
  try {
    const { slides, tema, asignatura, nivel } = await req.json();
    const prs = new pptxgen();
    prs.layout = "LAYOUT_16x9";

    const queries = await Promise.all(slides.map((sl: any) => getQueryIA(tema, sl.titulo || tema)));
    const imgs = await Promise.all(queries.map((q: string, i: number) => getImgGoogle(q, i)));

    const COLS = [
      { h: "1D4ED8", a: "F97316", bg: "EFF6FF", t: "1E3A8A" },
      { h: "7C3AED", a: "10B981", bg: "F5F3FF", t: "4C1D95" },
      { h: "0F766E", a: "F97316", bg: "F0FDF4", t: "134E4A" },
      { h: "B45309", a: "3B82F6", bg: "FFFBEB", t: "78350F" },
      { h: "BE185D", a: "06B6D4", bg: "FDF2F8", t: "831843" },
    ];

    for (let i = 0; i < slides.length; i++) {
      const sl = slides[i];
      const s = prs.addSlide();
      const img = imgs[i];
      const c = COLS[i % COLS.length];

      if (i === 0) {
        s.background = { color: "0F172A" };
        if (img) s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "000000", transparency: 40 }, line: { color: "000000", transparency: 40 } });
        s.addShape("rect", { x: 0, y: 4.2, w: 10, h: 3.3, fill: { color: "0F172A", transparency: 0 }, line: { color: "0F172A", transparency: 0 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.2, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addShape("rect", { x: 0, y: 0.2, w: 0.5, h: 7.3, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText("DocenApp", { x: 0.7, y: 0.3, w: 9, h: 0.45, fontSize: 12, color: "FED7AA", bold: true, align: "left" });
        s.addText(sl.titulo || tema, { x: 0.7, y: 0.9, w: 8.6, h: 3.0, fontSize: 40, bold: true, color: "FFFFFF", align: "left", valign: "middle" });
        s.addShape("rect", { x: 0.7, y: 4.1, w: 4, h: 0.08, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText(asignatura, { x: 0.7, y: 4.3, w: 9, h: 0.65, fontSize: 20, bold: true, color: "FFFFFF", align: "left" });
        s.addText("Nivel: " + nivel, { x: 0.7, y: 5.05, w: 9, h: 0.4, fontSize: 14, color: "FED7AA", align: "left" });

      } else if (i === slides.length - 1) {
        s.background = { color: "0F172A" };
        if (img) s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "000000", transparency: 40 }, line: { color: "000000", transparency: 40 } });
        s.addShape("rect", { x: 0, y: 3.8, w: 10, h: 3.7, fill: { color: "0F172A", transparency: 0 }, line: { color: "0F172A", transparency: 0 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.2, fill: { color: "10B981" }, line: { color: "10B981" } });
        s.addShape("rect", { x: 0, y: 0.2, w: 0.5, h: 7.3, fill: { color: "10B981" }, line: { color: "10B981" } });
        s.addText("Conclusion", { x: 0.7, y: 0.4, w: 9, h: 0.5, fontSize: 13, color: "6EE7B7", align: "left" });
        s.addText(sl.titulo || "Cierre", { x: 0.7, y: 0.9, w: 8.6, h: 1.3, fontSize: 34, bold: true, color: "FFFFFF", align: "left" });
        s.addShape("rect", { x: 0.6, y: 3.9, w: 8.8, h: 3.0, fill: { color: "064E3B", transparency: 10 }, line: { color: "10B981", transparency: 40 } });
        s.addText(sl.contenido || "", { x: 0.9, y: 4.05, w: 8.2, h: 2.7, fontSize: 15, color: "FFFFFF", align: "center", valign: "middle", wrap: true });
        s.addText("Gracias  |  DocenApp", { x: 0.5, y: 7.05, w: 9, h: 0.35, fontSize: 12, color: "6EE7B7", align: "center", bold: true });

      } else {
        s.background = { color: c.bg };
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 1.2, fill: { color: c.h }, line: { color: c.h } });
        s.addShape("rect", { x: 0, y: 0, w: 0.45, h: 1.2, fill: { color: c.a }, line: { color: c.a } });
        s.addText(sl.titulo || "", { x: 0.65, y: 0.15, w: 8.0, h: 0.9, fontSize: 21, bold: true, color: "FFFFFF", valign: "middle" });
        s.addText(i + "/" + (slides.length - 1), { x: 8.5, y: 0.3, w: 1.3, h: 0.6, fontSize: 11, color: "FFFFFF", align: "right" });

        if (img) {
          const dr = i % 2 !== 0;
          const ix = dr ? 5.6 : 0.3;
          const tx = dr ? 0.45 : 4.35;
          s.addImage({ data: img, x: ix, y: 1.25, w: 4.1, h: 5.85, sizing: { type: "cover", w: 4.1, h: 5.85 } });
          s.addShape("rect", { x: ix, y: 1.25, w: 4.1, h: 5.85, fill: { color: c.h, transparency: 55 }, line: { color: c.h, transparency: 55 } });
          s.addShape("rect", { x: tx - 0.1, y: 1.25, w: 5.05, h: 5.85, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
          s.addShape("rect", { x: tx - 0.1, y: 1.25, w: 0.15, h: 5.85, fill: { color: c.a }, line: { color: c.a } });
          const ls = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          s.addText(ls.map((l: string) => ({ text: "▸  " + l, options: { fontSize: 13, color: c.t, breakLine: true, paraSpaceAfter: 11 } })), { x: tx + 0.12, y: 1.4, w: 4.7, h: 5.6, valign: "top", wrap: true });
        } else {
          s.addShape("rect", { x: 0.3, y: 1.25, w: 9.4, h: 5.85, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
          s.addShape("rect", { x: 0.3, y: 1.25, w: 0.15, h: 5.85, fill: { color: c.a }, line: { color: c.a } });
          const ls = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          s.addText(ls.map((l: string) => ({ text: "▸  " + l, options: { fontSize: 14, color: c.t, breakLine: true, paraSpaceAfter: 12 } })), { x: 0.6, y: 1.4, w: 9.0, h: 5.6, valign: "top", wrap: true });
        }
        s.addShape("rect", { x: 0, y: 7.1, w: 10, h: 0.4, fill: { color: c.h }, line: { color: c.h } });
        s.addText("DocenApp  |  " + asignatura + "  |  " + nivel, { x: 0.3, y: 7.17, w: 9.4, h: 0.25, fontSize: 8.5, color: "FFFFFF", align: "center" });
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