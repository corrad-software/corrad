import PDFDocument from "pdfkit";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import sharp from "sharp";

export default defineEventHandler(async (event) => {
  try {
    const { markdownContent, mermaidDiagrams } = await readBody(event);

    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const htmlContent = marked(markdownContent);
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    for (const child of document.body.childNodes) {
      if (child.nodeType === dom.window.Node.TEXT_NODE) {
        doc.text(child.textContent.trim());
      } else if (child.nodeType === dom.window.Node.ELEMENT_NODE) {
        switch (child.tagName) {
          case "H1":
            doc.fontSize(24).text(child.textContent);
            break;
          case "H2":
            doc.fontSize(20).text(child.textContent);
            break;
          case "H3":
            doc.fontSize(16).text(child.textContent);
            break;
          case "H4":
          case "H5":
          case "H6":
            doc.fontSize(14).text(child.textContent);
            break;
          case "UL":
          case "OL":
            for (const li of child.children) {
              doc.fontSize(12).text(`• ${li.textContent}`);
            }
            break;
          case "TABLE":
            // Simplified table rendering
            for (const row of child.rows) {
              doc.fontSize(12).text(
                Array.from(row.cells)
                  .map((cell) => cell.textContent)
                  .join(" | ")
              );
            }
            break;
          case "PRE":
            doc.fontSize(10).text(child.textContent);
            break;
          case "P":
            const mermaidMatch = child.textContent
              .trim()
              .match(/^\[MERMAID_DIAGRAM_(\d+)\]$/);
            if (mermaidMatch) {
              const diagramIndex = parseInt(mermaidMatch[1]);
              const diagramKeys = Object.keys(mermaidDiagrams);
              const actualIndex = diagramKeys[diagramIndex] || diagramKeys[0];
              const diagram = mermaidDiagrams[actualIndex];

              if (diagram) {
                const base64Data = diagram.data.split(",")[1];
                const imageBuffer = Buffer.from(base64Data, "base64");

                const pngBuffer = await sharp(imageBuffer)
                  .resize({ width: 500, height: 300, fit: "inside" })
                  .png()
                  .toBuffer();

                doc.image(pngBuffer, {
                  width: 500,
                  height: 300,
                  fit: [500, 300],
                });
              } else {
                doc.text(`[Mermaid Diagram ${diagramIndex} not found]`);
              }
            } else {
              doc.fontSize(12).text(child.textContent);
            }
            break;
          default:
            doc.fontSize(12).text(child.textContent);
        }
      }
    }

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        setResponseHeaders(event, {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=markdown_export.pdf",
        });
        resolve(pdfBuffer);
      });
    });
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating PDF document",
    });
  }
});
