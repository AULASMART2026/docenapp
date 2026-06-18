import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

async function getImg(query: string, page: number): Promise<string | null> {
  try {
    const key = process.env.PEXELS_API_KEY;
    const q = encodeURIComponent(query);
    const res = await fetch("https://api.pexels.com/v1/search?query=" + q + "&per_page=3&page=1&orientation=landscape", {
      headers: { Authorization: key || "" },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const foto = data?.photos?.[page % (data?.photos?.length || 1)];
    const url = foto?.src?.large2x || foto?.src?.large;
    if (!url) return null;
    const imgRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!imgRes.ok) return null;
    const buf = await imgRes.arrayBuffer();
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    return "data:" + ct + ";base64," + Buffer.from(buf).toString("base64");
  } catch (e) {
    console.error("Pexels error:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { slides, tema, asignatura, nivel } = await req.json();
    const prs = new pptxgen();
    prs.layout = "LAYOUT_16x9";

    // Descargar imagen principal del tema
    const imgPrincipal = await getImg(tema, 0);
    const imgSecundaria = await getImg(asignatura + " classroom students", 1);
    const imgCierre = await getImg(tema + " success achievement", 2);

    for (let i = 0; i < slides.length; i++) {
      const sl = slides[i];
      const s = prs.addSlide();

      // ═══════════════════════════════════
      // PORTADA — imagen fondo + overlay gradiente
      // ═══════════════════════════════════
      if (i === 0) {
        s.background = { color: "0EA5E9" };
        if (imgPrincipal) {
          s.addImage({ data: imgPrincipal, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        }
        // Overlay oscuro para legibilidad
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "000000", transparency: 45 }, line: { color: "000000", transparency: 45 } });
        // Banda inferior colorida
        s.addShape("rect", { x: 0, y: 5.2, w: 10, h: 2.3, fill: { color: "0F172A", transparency: 20 }, line: { color: "0F172A", transparency: 20 } });
        // Linea decorativa superior naranja
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.18, fill: { color: "F97316" }, line: { color: "F97316" } });
        // Barra lateral izquierda
        s.addShape("rect", { x: 0, y: 0, w: 0.5, h: 7.5, fill: { color: "F97316" }, line: { color: "F97316" } });
        // Logo DocenApp
        s.addText("📚 DocenApp", { x: 0.7, y: 0.25, w: 9, h: 0.45, fontSize: 12, color: "FED7AA", align: "left", bold: true });
        // Titulo grande
        s.addText(sl.titulo || tema, { x: 0.7, y: 0.9, w: 8.8, h: 3.8, fontSize: 44, bold: true, color: "FFFFFF", align: "left", valign: "middle", charSpacing: -0.5 });
        // Separador naranja
        s.addShape("rect", { x: 0.7, y: 5.0, w: 3.5, h: 0.08, fill: { color: "F97316" }, line: { color: "F97316" } });
        // Asignatura
        s.addText(asignatura, { x: 0.7, y: 5.2, w: 9, h: 0.65, fontSize: 20, bold: true, color: "FFFFFF", align: "left" });
        // Nivel
        s.addText("Nivel: " + nivel, { x: 0.7, y: 5.95, w: 9, h: 0.4, fontSize: 14, color: "FED7AA", align: "left" });

      // ═══════════════════════════════════
      // SLIDE OBJETIVO (slide 1)
      // ═══════════════════════════════════
      } else if (i === 1) {
        s.background = { color: "F0F9FF" };
        // Header azul cielo
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 1.3, fill: { color: "0EA5E9" }, line: { color: "0EA5E9" } });
        s.addShape("rect", { x: 0, y: 0, w: 0.5, h: 1.3, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText(sl.titulo || "", { x: 0.7, y: 0.2, w: 8.5, h: 0.9, fontSize: 24, bold: true, color: "FFFFFF", valign: "middle" });
        // Imagen lateral derecha
        if (imgSecundaria) {
          s.addImage({ data: imgSecundaria, x: 5.8, y: 1.4, w: 4.0, h: 5.8, sizing: { type: "cover", w: 4.0, h: 5.8 } });
          s.addShape("rect", { x: 5.8, y: 1.4, w: 4.0, h: 5.8, fill: { color: "0EA5E9", transparency: 75 }, line: { color: "0EA5E9", transparency: 75 } });
        }
        // Area de contenido
        s.addShape("rect", { x: 0.4, y: 1.4, w: 5.2, h: 5.8, fill: { color: "FFFFFF" }, line: { color: "E0F2FE" } });
        s.addShape("rect", { x: 0.4, y: 1.4, w: 0.15, h: 5.8, fill: { color: "0EA5E9" }, line: { color: "0EA5E9" } });
        const lineas1 = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
        s.addText(lineas1.map((l: string) => ({ text: "→  " + l, options: { fontSize: 14, color: "0F172A", breakLine: true, paraSpaceAfter: 14 } })), { x: 0.7, y: 1.6, w: 4.8, h: 5.4, valign: "top", wrap: true });
        // Footer
        s.addShape("rect", { x: 0, y: 7.1, w: 10, h: 0.4, fill: { color: "0EA5E9" }, line: { color: "0EA5E9" } });
        s.addText("DocenApp  |  " + asignatura + "  |  " + nivel, { x: 0.3, y: 7.17, w: 9.4, h: 0.26, fontSize: 9, color: "FFFFFF", align: "center" });

      // ═══════════════════════════════════
      // SLIDES DE CONTENIDO (pares — imagen izquierda)
      // ═══════════════════════════════════
      } else if (i % 2 === 0 && i < slides.length - 1) {
        s.background = { color: "FFFFFF" };
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 1.3, fill: { color: "7C3AED" }, line: { color: "7C3AED" } });
        s.addShape("rect", { x: 0, y: 0, w: 0.5, h: 1.3, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText(sl.titulo || "", { x: 0.7, y: 0.2, w: 7.5, h: 0.9, fontSize: 22, bold: true, color: "FFFFFF", valign: "middle" });
        s.addText(i + "/" + (slides.length - 1), { x: 8.5, y: 0.35, w: 1.3, h: 0.6, fontSize: 12, color: "DDD6FE", align: "right" });
        // Imagen izquierda
        if (imgPrincipal) {
          s.addImage({ data: imgPrincipal, x: 0.3, y: 1.4, w: 4.2, h: 5.8, sizing: { type: "cover", w: 4.2, h: 5.8 } });
          s.addShape("rect", { x: 0.3, y: 1.4, w: 4.2, h: 5.8, fill: { color: "7C3AED", transparency: 70 }, line: { color: "7C3AED", transparency: 70 } });
        }
        // Texto derecha
        s.addShape("rect", { x: 4.8, y: 1.4, w: 5.0, h: 5.8, fill: { color: "FAF5FF" }, line: { color: "EDE9FE" } });
        s.addShape("rect", { x: 4.8, y: 1.4, w: 0.15, h: 5.8, fill: { color: "7C3AED" }, line: { color: "7C3AED" } });
        const lineas2 = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
        s.addText(lineas2.map((l: string) => ({ text: "▸  " + l, options: { fontSize: 13.5, color: "1E1B4B", breakLine: true, paraSpaceAfter: 12 } })), { x: 5.1, y: 1.6, w: 4.5, h: 5.4, valign: "top", wrap: true });
        s.addShape("rect", { x: 0, y: 7.1, w: 10, h: 0.4, fill: { color: "7C3AED" }, line: { color: "7C3AED" } });
        s.addText("DocenApp  |  " + asignatura, { x: 0.3, y: 7.17, w: 9.4, h: 0.26, fontSize: 9, color: "DDD6FE", align: "center" });

      // ═══════════════════════════════════
      // SLIDES DE CONTENIDO (impares — imagen derecha)
      // ═══════════════════════════════════
      } else if (i < slides.length - 1) {
        s.background = { color: "FFFFFF" };
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 1.3, fill: { color: "0F766E" }, line: { color: "0F766E" } });
        s.addShape("rect", { x: 0, y: 0, w: 0.5, h: 1.3, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText(sl.titulo || "", { x: 0.7, y: 0.2, w: 7.5, h: 0.9, fontSize: 22, bold: true, color: "FFFFFF", valign: "middle" });
        s.addText(i + "/" + (slides.length - 1), { x: 8.5, y: 0.35, w: 1.3, h: 0.6, fontSize: 12, color: "CCFBF1", align: "right" });
        // Texto izquierda
        s.addShape("rect", { x: 0.3, y: 1.4, w: 5.0, h: 5.8, fill: { color: "F0FDF9" }, line: { color: "CCFBF1" } });
        s.addShape("rect", { x: 0.3, y: 1.4, w: 0.15, h: 5.8, fill: { color: "0F766E" }, line: { color: "0F766E" } });
        const lineas3 = (sl.contenido || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
        s.addText(lineas3.map((l: string) => ({ text: "▸  " + l, options: { fontSize: 13.5, color: "134E4A", breakLine: true, paraSpaceAfter: 12 } })), { x: 0.6, y: 1.6, w: 4.6, h: 5.4, valign: "top", wrap: true });
        // Imagen derecha
        if (imgSecundaria) {
          s.addImage({ data: imgSecundaria, x: 5.5, y: 1.4, w: 4.3, h: 5.8, sizing: { type: "cover", w: 4.3, h: 5.8 } });
          s.addShape("rect", { x: 5.5, y: 1.4, w: 4.3, h: 5.8, fill: { color: "0F766E", transparency: 70 }, line: { color: "0F766E", transparency: 70 } });
        }
        s.addShape("rect", { x: 0, y: 7.1, w: 10, h: 0.4, fill: { color: "0F766E" }, line: { color: "0F766E" } });
        s.addText("DocenApp  |  " + asignatura, { x: 0.3, y: 7.17, w: 9.4, h: 0.26, fontSize: 9, color: "CCFBF1", align: "center" });

      // ═══════════════════════════════════
      // CIERRE
      // ═══════════════════════════════════
      } else {
        s.background = { color: "0F172A" };
        if (imgCierre) {
          s.addImage({ data: imgCierre, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: "cover", w: 10, h: 7.5 } });
        }
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 7.5, fill: { color: "000000", transparency: 50 }, line: { color: "000000", transparency: 50 } });
        s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.18, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addShape("rect", { x: 0, y: 0, w: 0.5, h: 7.5, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addText("Conclusion", { x: 0.7, y: 0.5, w: 9, h: 0.5, fontSize: 14, color: "FED7AA", align: "left", bold: false });
        s.addText(sl.titulo || "Cierre", { x: 0.7, y: 1.1, w: 9, h: 1.3, fontSize: 36, bold: true, color: "FFFFFF", align: "left" });
        s.addShape("rect", { x: 0.7, y: 2.5, w: 3.5, h: 0.08, fill: { color: "F97316" }, line: { color: "F97316" } });
        s.addShape("roundRect", { x: 0.7, y: 2.8, w: 8.6, h: 3.2, fill: { color: "FFFFFF", transparency: 25 }, line: { color: "FFFFFF", transparency: 60 }, rectRadius: 0.2 });
        s.addText(sl.contenido || "", { x: 1.0, y: 3.0, w: 8.0, h: 2.8, fontSize: 16, color: "FFFFFF", align: "center", valign: "middle", wrap: true, bold: false });
        s.addText("¡Gracias!  |  DocenApp", { x: 0.5, y: 6.8, w: 9, h: 0.5, fontSize: 14, color: "FED7AA", align: "center", bold: true });
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