import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
} from "docx";
import { marked } from "marked";
import mermaid from "mermaid";
import { JSDOM } from "jsdom";

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

    mermaid.initialize({ startOnLoad: false });

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
          case "PRE":
            if (
              child.firstChild &&
              child.firstChild.classList.contains("language-mermaid")
            ) {
              try {
                const { svg } = await mermaid.render(
                  "mermaid-diagram",
                  child.textContent
                );
                const base64Svg = Buffer.from(svg).toString("base64");
                const imageRun = new ImageRun({
                  data: base64Svg,
                  transformation: { width: 500, height: 300 },
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
