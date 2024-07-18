import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
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

    // Convert markdown to HTML
    const htmlContent = marked(markdownContent);
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Initialize mermaid
    mermaid.initialize({ startOnLoad: false });

    // Process each element
    for (const child of document.body.childNodes) {
      if (child.nodeType === dom.window.Node.TEXT_NODE) {
        paragraphs.push(
          new Paragraph({ children: [new TextRun(child.textContent)] })
        );
      } else if (child.nodeType === dom.window.Node.ELEMENT_NODE) {
        if (child.classList.contains("language-mermaid")) {
          // Render Mermaid diagram
          const { svg } = await mermaid.render(
            "mermaid-diagram",
            child.textContent
          );

          // Convert SVG to base64
          const base64Svg = Buffer.from(svg).toString("base64");

          const imageRun = new ImageRun({
            data: base64Svg,
            transformation: { width: 500, height: 300 },
          });
          paragraphs.push(new Paragraph({ children: [imageRun] }));
        } else {
          // Handle other HTML elements as needed
          paragraphs.push(
            new Paragraph({ children: [new TextRun(child.textContent)] })
          );
        }
      }
    }

    doc.addSection({ children: paragraphs });

    // Generate the docx file
    const buffer = await Packer.toBuffer(doc);

    // Set response headers
    setResponseHeaders(event, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=markdown_export.docx",
    });

    // Send the buffer as the response
    return buffer;
  } catch (error) {
    console.error("Error exporting to Word:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating Word document",
    });
  }
});
