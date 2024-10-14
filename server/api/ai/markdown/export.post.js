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
  Header,
  Footer,
} from "docx";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import sharp from "sharp";
import sanitizeHtml from "sanitize-html";

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height", "style"],
  },
  allowedSchemes: ["data", "http", "https"],
};

const processImage = async (imgElement) => {
  try {
    const imgSrc = imgElement.getAttribute("src");
    const imageData = imgSrc.startsWith("data:image")
      ? Buffer.from(imgSrc.split(",")[1], "base64")
      : Buffer.from(await (await fetch(imgSrc)).arrayBuffer());

    const width = parseInt(imgElement.style.width) || imgElement.width || 200;
    const height =
      parseInt(imgElement.style.height) || imgElement.height || 200;

    return new ImageRun({
      data: imageData,
      transformation: { width, height },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
};

const processParagraphContent = async (childNodes, nodeTypes) => {
  const paragraphChildren = [];

  for (const child of childNodes) {
    if (child.nodeType === nodeTypes.TEXT_NODE && child.textContent.trim()) {
      paragraphChildren.push(new TextRun(child.textContent.trim()));
    } else if (
      child.nodeType === nodeTypes.ELEMENT_NODE &&
      child.tagName === "IMG"
    ) {
      const imageRun = await processImage(child);
      if (imageRun) paragraphChildren.push(imageRun);
    }
  }

  return paragraphChildren;
};

const parseHtmlContent = async (htmlContent) => {
  const cleanHtml = sanitizeHtml(htmlContent, sanitizeOptions);
  const dom = new JSDOM(cleanHtml);
  const document = dom.window.document;
  const nodeTypes = dom.window.Node;
  const parsedContent = [];

  for (const child of document.body.childNodes) {
    if (child.nodeType === nodeTypes.TEXT_NODE && child.textContent.trim()) {
      parsedContent.push(
        new Paragraph({ children: [new TextRun(child.textContent.trim())] })
      );
    } else if (
      child.nodeType === nodeTypes.ELEMENT_NODE &&
      child.tagName === "P"
    ) {
      const paragraphChildren = await processParagraphContent(
        child.childNodes,
        nodeTypes
      );
      if (paragraphChildren.length > 0) {
        parsedContent.push(new Paragraph({ children: paragraphChildren }));
      }
    }
  }

  return parsedContent;
};

const createHeadersAndFooters = async (template) => {
  const headers = template?.headerContent
    ? {
        default: new Header({
          children: await parseHtmlContent(template.headerContent),
        }),
      }
    : {};
  const footers = template?.footerContent
    ? {
        default: new Footer({
          children: await parseHtmlContent(template.footerContent),
        }),
      }
    : {};
  return { headers, footers };
};

export default defineEventHandler(async (event) => {
  try {
    const { markdownContent, mermaidDiagrams, htmlPreviews, templateId } =
      await readBody(event);

    const template = templateId
      ? await prisma.document_template.findUnique({
          where: { templateID: parseInt(templateId) },
        })
      : null;

    const { headers, footers } = await createHeadersAndFooters(template);

    // Parse markdown content
    const htmlContent = marked(markdownContent);
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const paragraphs = [];

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
            const htmlMatch = child.textContent
              .trim()
              .match(/^\[HTML_PREVIEW_(\d+)\]$/);

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
            } else if (htmlMatch) {
              const htmlIndex = parseInt(htmlMatch[1]);
              const htmlPreviewKeys = Object.keys(htmlPreviews);
              const actualIndex =
                htmlPreviewKeys[htmlIndex] || htmlPreviewKeys[0];
              const htmlPreview = htmlPreviews[actualIndex];

              if (htmlPreview) {
                const base64Data = htmlPreview.data.split(",")[1];
                const imageBuffer = Buffer.from(base64Data, "base64");

                // Calculate dimensions to maintain exact aspect ratio
                const maxWidth = 600; // Maximum width in the document
                const maxHeight = 800; // Maximum height
                let width, height;

                if (htmlPreview.aspectRatio > maxWidth / maxHeight) {
                  width = maxWidth;
                  height = Math.round(width / htmlPreview.aspectRatio);
                } else {
                  height = maxHeight;
                  width = Math.round(height * htmlPreview.aspectRatio);
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
                      new TextRun(`[HTML Preview ${htmlIndex} not found]`),
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

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
          headers,
          footers,
        },
      ],
      creator: "Your Application",
      title: "Markdown Export",
    });

    // Add last page content if template has lastPageContent
    if (template && template.lastPageContent) {
      const lastPageSection = {
        properties: { type: "NEXT_PAGE" },
        children: await parseHtmlContent(template.lastPageContent),
      };
      doc.addSection(lastPageSection);
    }

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
