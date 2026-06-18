import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

async function getImg(query: string): Promise<string | null> {
  try {
    const key = process.env.PEXELS_API_KEY;
    const q = encodeURIComponent(query);
    const rand = Math.floor(Math.random() * 10) + 1;
    const res = await fetch("https://api.pexels.com/v1/search?query=" + q + "&per_page=1&page=" + rand + "&orientation=landscape", {
      headers: { Authorization: key || "" },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.photos?.[0]?.src?.large2x || data?.photos?.[0]?.src?.large;
    if (!url) return null;
    const imgRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!imgRes.ok) return null;
    const buf = await imgRes.arrayBuffer();
    return "data:" + (imgRes.headers.get("content-type") || "image/jpeg") + ";base64," + Buffer.from(buf).toString("base64");
  } catch { return null; }
}

export async function POST(req: Request) {
  try {
    const { slides, tema, asignatura, nivel } = await req.json();
    const prs = new pptxgen();
    prs.layout = "LAYOUT_16x9";

    // Una imagen unica por slide con query contextual
    const queries = slides.map((sl: any, i: number) => {
      if (i === 0) return tema + " education";
      if (i === slides.length - 1) return "success students achievement school";
      return (sl.titulo || tema) + " " + asignatura + " learning";
    });
    const imgs = await Promise.all(queries.map((q: string) => getImg(q)));

    const COLORES = [
      { header: "2563EB", accent: "F97316", bg: "EFF6FF", text: "1E3A8A", textLight: "DBEAFE" },
      { header: "7C3AED", accent: "10B981", bg: "F5F3FF", text: "4C1D95", textLight: "EDE9FE" },
      { header: "0F766E", accent: "F97316", bg: "F0FDF4", text: "134E4A", textLight: "CCFBF1" },
      { header: "B45309", accent: "3B82F6", bg: "FFFBEB", text: "78350F", textLight: "FDE68A" },
      { header: "BE185D", accent: "06B6D4", bg: "FDF2F8", text: "831843", textLight: "FCE7F3" },
    ];

    for (let i = 0; i < slides.length; i++) {
      const sl = slides[i];
      const s = prs.addSlide();
      const img = imgs[i];
      const col = COLORES[i % COLORES.length];

      // ═══ PORTADA ═══
      if (i === 0) {
        s.background = { color: "0F172A" };
        if (img) s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        // Overlay oscuro fuerte para legibilidad
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "000000", transparency: 35 }, line: { color: "000000", transparency: 35 } });
        // Gradiente inferior solido
        s.addShape("rect", { x: 0, y: 4.0, w: 10, h: 3.5, fill: { color: "0F172A", transparency: 0 }, line: { color: "0F172A", transparency: 0 } });
        // Barra naranja superior
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.2, fill: { color: "F97316" }, line: { color: "F97316" } });
        // Barra lateral
        s.addShape("rect", { x: 0, y: 0.2, w: 0.5, h: 7.3, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText("📚 DocenApp", { x: 0.7, y: 0.3, w: 9, h: 0.45, fontSize: 12, color: "FED7AA", bold: true, align: "left" });
        s.addText(sl.titulo || tema, { x: 0.7, y: 0.9, w: 8.6, h: 2.8, fontSize: 42, bold: true, color: "FFFFFF", align: "left", valign: "middle" });
        s.addShape("rect", { x: 0.7, y: 3.9, w: 4, h: 0.08, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText(asignatura, { x: 0.7, y: 4.1, w: 9, h: 0.65, fontSize: 20, bold: true, color: "FFFFFF", align: "left" });
        s.addText("Nivel: " + nivel, { x: 0.7, y: 4.85, w: 9, h: 0.4, fontSize: 14, color: "FED7AA", align: "left" });

      // ═══ CIERRE ═══
      } else if (i === slides.length - 1) {
        s.background = { color: "0F172A" };
        if (img) s.addImage({ data: img, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "000000", transparency: 35 }, line: { color: "000000", transparency: 35 } });
        // Banda inferior oscura solida para texto legible
        s.addShape("rect", { x: 0, y: 3.5, w: 10, h: 4.0, fill: { color: "0F172A", transparency: 0 }, line: { color: "0F172A", transparency: 0 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.2, fill: { color: "10B981" }, line: { color: "10B981" } });
        s.addShape("rect", { x: 0, y: 0.2, w: 0.5, h: 7.3, fill: { color: "10B981" }, line: { color: "10B981" } });
        s.addText("Conclusion", { x: 0.7, y: 0.4, w: 9, h: 0.5, fontSize: 13, color: "6EE7B7", align: "left" });
        s.addText(sl.titulo || "Cierre", { x: 0.7, y: 0.9, w: 8.6, h: 1.3, fontSize: 34, bold: true, color: "FFFFFF", align: "left" });
        s.addShape("rect", { x: 0.7, y: 3.6, w: 8.6, h: 3.0, fill: { color: "064E3B", transparency: 10 }, line: { color: "10B981", transparency: 40 } });
        s.addText(sl.contenido || "", { x: 1.0, y: 3.75, w: 8.0, h: 2.7, fontSize: 15, color: "FFFFFF", align: "center", valign: "middle", wrap: true });
        s.addText("¡Gracias!  |  DocenApp", { x: 0.5, y: 7.0, w: 9, h: 0.4, fontSize: 12, color: "6EE7B7", align: "center", bold: true });

      // ═══ CONTENIDO ═══
      } else {
        s.background = { color: col.bg };
        // Header colorido
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 1.2, fill: { color: col.header }, line: { color: col.header } });
        s.addShape("rect", { x: 0, y: 0, w: 0.45, h: 1.2, fill: { color: col.accent }, line: { color: col.accent } });
        s.addText(sl.titulo || "", { x: 0.65, y: 0.15, w: 8.0, h: 0.9, fontSize: 21, bold: true, color: "FFFFFF", valign: "middle" });
        s.addText(i + " / " + (slides.length - 1), { x: 8.4, y: 0.3, w: 1.4, h: 0.6, fontSize: 11, color: col.textLight, align: "right" });

        if (img) {
          // Imagen ocupa mitad derecha o izquierda alternando
          const derecha = i % 2 !== 0;
          const ix = derecha ? 5.6 : 0.3;
          const tx = derecha ? 0.45 : 4.35;
          const tw = 4.9;

          s.addImage({ data: img, x: ix, y: 1.25, w: 4.1, h: 5.95, sizing: { type: "cover", w: 4.1, h: 5.95 } });
          // Overlay suave sobre imagen para no tapar contenido
          s.addShape("rect", { x: ix, y: 1.25, w: 4.1, h: 5.95, fill: { color: col.header, transparency: 60 }, line: { color: col.header, transparency: 60 } });

          // Fondo para texto — color solido legible
          s.addShape("rect", { x: tx - 0.1, y: 1.25, w: tw + 0.15, h: 5.95, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
          s.addShape("rect", { x: tx - 0.1, y: 1.25, w: 0.15, h: 5.95, fill: { color: col.accent }, line: { color: col.accent } });

          const lineas = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          s.addText(
            lineas.map((l: string) => ({ text: "▸  " + l, options: { fontSize: 13, color: col.text, breakLine: true, paraSpaceAfter: 11 } })),
            { x: tx + 0.12, y: 1.4, w: tw - 0.25, h: 5.65, valign: "top", wrap: true }
          );
        } else {
          s.addShape("rect", { x: 0.3, y: 1.25, w: 9.4, h: 5.95, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
          s.addShape("rect", { x: 0.3, y: 1.25, w: 0.15, h: 5.95, fill: { color: col.accent }, line: { color: col.accent } });
          const lineas = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
          s.addText(
            lineas.map((l: string) => ({ text: "▸  " + l, options: { fontSize: 14, color: col.text, breakLine: true, paraSpaceAfter: 12 } })),
            { x: 0.6, y: 1.4, w: 9.0, h: 5.65, valign: "top", wrap: true }
          );
        }

        // Footer
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