import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    const templateID = parseInt(event.context.params.id);

    const {
      templateName,
      templateDescription,
      templateType,
      headerContent,
      footerContent,
      firstPageContent,
      lastPageContent,
      bodyContent,
    } = await readBody(event);

    if (!templateName || !templateType) {
      return {
        statusCode: 400,
        message: "Template name and type are required",
      };
    }

    const existingTemplate = await prisma.document_template.findUnique({
      where: {
        templateID: templateID,
        userID: userID,
      },
    });

    if (!existingTemplate) {
      return {
        statusCode: 404,
        message: "Template not found or you don't have permission to edit it",
      };
    }

    const updatedTemplate = await prisma.document_template.update({
      where: {
        templateID: templateID,
      },
      data: {
        templateName: templateName,
        templateDescription: templateDescription || "",
        templateType: templateType,
        headerContent: headerContent || "",
        footerContent: footerContent || "",
        firstPageContent: firstPageContent || "",
        lastPageContent: lastPageContent || "",
        bodyContent: bodyContent || "",
        templateModifiedDate: DateTime.now().toJSDate(),
      },
    });

    if (!updatedTemplate) {
      return {
        statusCode: 500,
        message: "Failed to update template",
      };
    }

    return {
      statusCode: 200,
      message: "Template updated successfully",
      data: {
        templateID: updatedTemplate.templateID,
        templateName: updatedTemplate.templateName,
      },
    };
  } catch (error) {
    console.error("Error updating template:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
