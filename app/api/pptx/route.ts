import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

async function getImg(query: string, pagina: number): Promise<string | null> {
  try {
    const key = process.env.PEXELS_API_KEY;
    const q = encodeURIComponent(query);
    const res = await fetch("https://api.pexels.com/v1/search?query=" + q + "&per_page=5&page=1&orientation=landscape", {
      headers: { Authorization: key || "" },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const fotos = data?.photos || [];
    if (!fotos.length) return null;
    const foto = fotos[pagina % fotos.length];
    const url = foto?.src?.large2x || foto?.src?.large;
    if (!url) return null;
    const imgRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!imgRes.ok) return null;
    const buf = await imgRes.arrayBuffer();
    return "data:" + (imgRes.headers.get("content-type") || "image/jpeg") + ";base64," + Buffer.from(buf).toString("base64");
  } catch { return null; }
}

function getQueries(tema: string, asignatura: string, tituloSlide: string): string {
  const t = tema.toLowerCase();
  const a = asignatura.toLowerCase();
  const ts = tituloSlide.toLowerCase();
  
  // Mapeo contextual por asignatura
  if (a.includes("lenguaje") || a.includes("literatura")) {
    if (t.includes("neruda") || t.includes("mistral") || t.includes("parra") || t.includes("poeta")) return "poetry book reading literature Chile";
    if (t.includes("novela") || t.includes("cuento")) return "books reading story literature";
    if (t.includes("oral") || t.includes("exposicion")) return "students presentation speaking classroom";
    return "reading books library education";
  }
  if (a.includes("matematica")) {
    if (ts.includes("fracci") || t.includes("fracci")) return "math fractions numbers chalkboard";
    if (ts.includes("geometr") || t.includes("geometr")) return "geometry shapes mathematics";
    if (ts.includes("algebra") || t.includes("algebra")) return "algebra equations mathematics board";
    return "mathematics numbers classroom students";
  }
  if (a.includes("historia") || a.includes("ciencias sociales")) {
    if (t.includes("chile") || t.includes("chilena")) return "Chile history culture Andes Santiago";
    if (t.includes("independencia")) return "independence history Latin America monument";
    if (t.includes("democracia")) return "democracy government election civic";
    return "history map ancient civilization";
  }
  if (a.includes("ciencias naturales") || a.includes("biolog") || a.includes("quimic") || a.includes("fisica")) {
    if (t.includes("celula") || ts.includes("celula")) return "cell biology microscope science lab";
    if (t.includes("solar") || ts.includes("solar")) return "solar system planets astronomy space";
    if (t.includes("ecosistema")) return "ecosystem nature forest wildlife";
    return "science laboratory experiment students";
  }
  if (a.includes("ingles")) return "english language learning classroom international";
  if (a.includes("arte") || a.includes("visual")) return "art painting creative studio colors";
  if (a.includes("musica")) return "music instruments concert performance";
  if (a.includes("educacion fisica")) return "sports students physical activity exercise";
  if (a.includes("tecnologia")) return "technology computer programming digital";
  
  // Query generico mejorado
  return tema + " education school learning";
}

export async function POST(req: Request) {
  try {
    const { slides, tema, asignatura, nivel } = await req.json();
    const prs = new pptxgen();
    prs.layout = "LAYOUT_16x9";

    // Query unico y contextual por slide
    const imgs = await Promise.all(slides.map((sl: any, i: number) => {
      const query = getQueries(tema, asignatura, sl.titulo || "");
      return getImg(query, i);
    }));

    const COLORES = [
      { header: "1D4ED8", accent: "F97316", bg: "EFF6FF", text: "1E3A8A" },
      { header: "7C3AED", accent: "10B981", bg: "F5F3FF", text: "4C1D95" },
      { header: "0F766E", accent: "F97316", bg: "F0FDF4", text: "134E4A" },
      { header: "B45309", accent: "3B82F6", bg: "FFFBEB", text: "78350F" },
      { header: "BE185D", accent: "06B6D4", bg: "FDF2F8", text: "831843" },
    ];

    for (let i = 0; i < slides.length; i++) {
      const sl = slides[i];
      const s = prs.addSlide();
      const img = imgs[i];
      const col = COLORES[i % COLORES.length];

      if (i === 0) {
        s.background = { color: "0F172A" };
        if (img) s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "000000", transparency: 40 }, line: { color: "000000", transparency: 40 } });
        s.addShape("rect", { x: 0, y: 4.2, w: 10, h: 3.3, fill: { color: "0F172A", transparency: 0 }, line: { color: "0F172A", transparency: 0 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.2, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addShape("rect", { x: 0, y: 0.2, w: 0.5, h: 7.3, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText("📚 DocenApp", { x: 0.7, y: 0.3, w: 9, h: 0.45, fontSize: 12, color: "FED7AA", bold: true, align: "left" });
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
        s.addText("¡Gracias!  |  DocenApp", { x: 0.5, y: 7.05, w: 9, h: 0.35, fontSize: 12, color: "6EE7B7", align: "center", bold: true });

      } else {
        s.background = { color: col.bg };
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 1.2, fill: { color: col.header }, line: { color: col.header } });
        s.addShape("rect", { x: 0, y: 0, w: 0.45, h: 1.2, fill: { color: col.accent }, line: { color: col.accent } });
        s.addText(sl.titulo || "", { x: 0.65, y: 0.15, w: 8.0, h: 0.9, fontSize: 21, bold: true, color: "FFFFFF", valign: "middle" });
        s.addText(i + " / " + (slides.length - 1), { x: 8.4, y: 0.3, w: 1.4, h: 0.6, fontSize: 11, color: "FFFFFF", align: "right" });

        if (img) {
          const derecha = i % 2 !== 0;
          const ix = derecha ? 5.6 : 0.3;
          const tx = derecha ? 0.45 : 4.35;
          const tw = 4.9;
          s.addImage({ data: img, x: ix, y: 1.25, w: 4.1, h: 5.85, sizing: { type: "cover", w: 4.1, h: 5.85 } });
          s.addShape("rect", { x: ix, y: 1.25, w: 4.1, h: 5.85, fill: { color: col.header, transparency: 55 }, line: { color: col.header, transparency: 55 } });
          s.addShape("rect", { x: tx - 0.1, y: 1.25, w: tw + 0.15, h: 5.85, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
          s.addShape("rect", { x: tx - 0.1, y: 1.25, w: 0.15, h: 5.85, fill: { color: col.accent }, line: { color: col.accent } });
          const lineas = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          s.addText(lineas.map((l: string) => ({ text: "▸  " + l, options: { fontSize: 13, color: col.text, breakLine: true, paraSpaceAfter: 11 } })), { x: tx + 0.12, y: 1.4, w: tw - 0.25, h: 5.6, valign: "top", wrap: true });
        } else {
          s.addShape("rect", { x: 0.3, y: 1.25, w: 9.4, h: 5.85, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
          s.addShape("rect", { x: 0.3, y: 1.25, w: 0.15, h: 5.85, fill: { color: col.accent }, line: { color: col.accent } });
          const lineas = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          s.addText(lineas.map((l: string) => ({ text: "▸  " + l, options: { fontSize: 14, color: col.text, breakLine: true, paraSpaceAfter: 12 } })), { x: 0.6, y: 1.4, w: 9.0, h: 5.6, valign: "top", wrap: true });
        }
        s.addShape("rect", { x: 0, y: 7.1, w: 10, h: 0.4, fill: { color: col.header }, line: { color: col.header } });
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