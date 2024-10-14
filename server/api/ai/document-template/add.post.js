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

    const newTemplate = await prisma.document_template.create({
      data: {
        userID: userID,
        templateName: templateName,
        templateDescription: templateDescription || "",
        templateType: templateType,
        headerContent: headerContent || "",
        footerContent: footerContent || "",
        firstPageContent: firstPageContent || "",
        lastPageContent: lastPageContent || "",
        bodyContent: bodyContent || "",
        templateStatus: "ACTIVE",
        templateCreatedDate: DateTime.now().toJSDate(),
        templateModifiedDate: DateTime.now().toJSDate(),
      },
    });

    if (!newTemplate) {
      return {
        statusCode: 500,
        message: "Failed to create template",
      };
    }

    return {
      statusCode: 200,
      message: "Template created successfully",
      data: {
        templateID: newTemplate.templateID,
        templateName: newTemplate.templateName,
      },
    };
  } catch (error) {
    console.error("Error creating template:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
