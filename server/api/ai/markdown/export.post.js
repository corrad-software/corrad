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
import puppeteer from "puppeteer";

export default defineEventHandler(async (event) => {
  try {
    const { markdownContent } = await readBody(event);

    const doc = new Document({
      sections: [],
      creator: "Your Application",
      title: "Markdown Export",
    });
    const paragraphs = [];

    const htmlContent = marked(markdownContent);
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (const child of document.body.childNodes) {
      if (child.nodeType === dom.window.Node.TEXT_NODE) {
        paragraphs.push(
          new Paragraph({ children: [new TextRun(child.textContent.trim())] })
        );
      } else if (child.nodeType === dom.window.Node.ELEMENT_NODE) {
        switch (child.tagName) {
          case "H1":
          case "H2":
          case "H3":
          case "H4":
          case "H5":
          case "H6":
            paragraphs.push(
              new Paragraph({
                text: child.textContent,
                heading: HeadingLevel[child.tagName],
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
                // Render Mermaid diagram using Puppeteer
                await page.setContent(`
                  <html>
                    <body>
                      <pre class="mermaid">${child.textContent}</pre>
                      <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
                      <script>
                        mermaid.initialize({ startOnLoad: true });
                      </script>
                    </body>
                  </html>
                `);
                await page.waitForSelector("svg");
                const element = await page.$("svg");

                // Get the bounding box of the SVG
                const boundingBox = await element.boundingBox();

                // Calculate dimensions while maintaining aspect ratio
                const maxWidth = 500;
                const maxHeight = 300;
                let width = boundingBox.width;
                let height = boundingBox.height;

                if (width > maxWidth) {
                  height = (height * maxWidth) / width;
                  width = maxWidth;
                }

                if (height > maxHeight) {
                  width = (width * maxHeight) / height;
                  height = maxHeight;
                }

                const pngBuffer = await element.screenshot({
                  type: "png",
                  clip: {
                    x: boundingBox.x,
                    y: boundingBox.y,
                    width: boundingBox.width,
                    height: boundingBox.height,
                  },
                });

                const imageRun = new ImageRun({
                  data: pngBuffer,
                  transformation: {
                    width: width,
                    height: height,
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
          default:
            paragraphs.push(
              new Paragraph({ children: [new TextRun(child.textContent)] })
            );
        }
      }
    }

    // Close the browser
    await browser.close();

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
