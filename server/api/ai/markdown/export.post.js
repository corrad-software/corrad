import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
} from "docx";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import sharp from "sharp";

export default defineEventHandler(async (event) => {
  try {
    const { markdownContent, mermaidDiagrams } = await readBody(event);

    const doc = new Document({
      sections: [],
      creator: "Your Application",
      title: "Markdown Export",
    });
    const paragraphs = [];

    const htmlContent = marked(markdownContent);
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    for (const child of document.body.childNodes) {
      if (child.nodeType === dom.window.Node.TEXT_NODE) {
        paragraphs.push(
          new Paragraph({ children: [new TextRun(child.textContent.trim())] })
        );
      } else if (child.nodeType === dom.window.Node.ELEMENT_NODE) {
        switch (child.tagName) {
          case "H1":
            paragraphs.push(
              new Paragraph({
                text: child.textContent,
                heading: HeadingLevel.HEADING_1,
              })
            );
            break;
          case "H2":
            paragraphs.push(
              new Paragraph({
                text: child.textContent,
                heading: HeadingLevel.HEADING_2,
              })
            );
            break;
          case "H3":
            paragraphs.push(
              new Paragraph({
                text: child.textContent,
                heading: HeadingLevel.HEADING_3,
              })
            );
            break;
          case "H4":
            paragraphs.push(
              new Paragraph({
                text: child.textContent,
                heading: HeadingLevel.HEADING_4,
              })
            );
            break;
          case "H5":
            paragraphs.push(
              new Paragraph({
                text: child.textContent,
                heading: HeadingLevel.HEADING_5,
              })
            );
            break;
          case "H6":
            paragraphs.push(
              new Paragraph({
                text: child.textContent,
                heading: HeadingLevel.HEADING_6,
              })
            );
            break;
          case "UL":
          case "OL":
            for (const li of child.children) {
              paragraphs.push(
                new Paragraph({
                  text: li.textContent,
                  bullet: {
                    level: 0,
                  },
                })
              );
            }
            break;
          case "TABLE":
            const table = new Table({
              rows: Array.from(child.rows).map((row) => {
                return new TableRow({
                  children: Array.from(row.cells).map((cell) => {
                    return new TableCell({
                      children: [new Paragraph(cell.textContent)],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    });
                  }),
                });
              }),
            });
            paragraphs.push(table);
            break;
          case "PRE":
            if (
              child.firstChild &&
              child.firstChild.classList.contains("language-mermaid")
            ) {
              try {
                // Initialize mermaid
                mermaid.initialize({ startOnLoad: false });

                // Render Mermaid diagram
                const { svg } = await mermaid.render(
                  "mermaid-diagram",
                  child.textContent
                );

                // Convert SVG to PNG using sharp
                const pngBuffer = await sharp(Buffer.from(svg))
                  .resize({ width: 500, height: 300, fit: "inside" })
                  .png()
                  .toBuffer();

                const imageRun = new ImageRun({
                  data: pngBuffer,
                  transformation: {
                    width: 500,
                    height: 300,
                  },
                });
                paragraphs.push(new Paragraph({ children: [imageRun] }));
              } catch (error) {
                console.error("Error rendering Mermaid diagram:", error);
                paragraphs.push(
                  new Paragraph({
                    children: [new TextRun("Error rendering diagram")],
                  })
                );
              }
            } else {
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: child.textContent,
                      font: "Courier New",
                    }),
                  ],
                })
              );
            }
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

                // Calculate dimensions to maintain exact aspect ratio
                const maxWidth = 600; // Maximum width in the document
                const maxHeight = 800; // Increased maximum height
                let width, height;

                if (diagram.aspectRatio > maxWidth / maxHeight) {
                  // Image is wider than the target aspect ratio
                  width = maxWidth;
                  height = Math.round(width / diagram.aspectRatio);
                } else {
                  // Image is taller than the target aspect ratio
                  height = maxHeight;
                  width = Math.round(height * diagram.aspectRatio);
                }

                const pngBuffer = await sharp(imageBuffer)
                  .resize({
                    width: width,
                    height: height,
                    fit: sharp.fit.contain,
                    background: { r: 255, g: 255, b: 255, alpha: 1 },
                  })
                  .png({ quality: 100 })
                  .toBuffer();

                const imageRun = new ImageRun({
                  data: pngBuffer,
                  transformation: {
                    width: width,
                    height: height,
                  },
                });
                paragraphs.push(new Paragraph({ children: [imageRun] }));
              } else {
                paragraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun(
                        `[Mermaid Diagram ${diagramIndex} not found]`
                      ),
                    ],
                  })
                );
              }
            } else {
              paragraphs.push(
                new Paragraph({ children: [new TextRun(child.textContent)] })
              );
            }
            break;
          default:
            paragraphs.push(
              new Paragraph({ children: [new TextRun(child.textContent)] })
            );
        }
      }
    }

    doc.addSection({ children: paragraphs });

    const buffer = await Packer.toBuffer(doc);

    setResponseHeaders(event, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=markdown_export.docx",
    });

    return buffer;
  } catch (error) {
    console.error("Error exporting to Word:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating Word document",
    });
  }
});
