export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized.",
      };
    }

    // const { type } = getQuery(event);
    // if (!type) {
    //   return {
    //     statusCode: 400,
    //     message: "Template type is required.",
    //   };
    // }

    // Fetch templates for the user
    const templates = await prisma.document_template.findMany({
      where: {
        userID: userID,
        templateStatus: "ACTIVE", // Assuming you want to fetch only active templates
      },
      select: {
        templateID: true,
        templateName: true,
        templateDescription: true,
        templateType: true,
        templateCreatedDate: true,
        templateModifiedDate: true,
      },
      orderBy: {
        templateModifiedDate: "desc",
      },
    });

    if (!templates) {
      return {
        statusCode: 404,
        message: "No templates found.",
      };
    }

    const remappedTemplates = templates.map((template) => {
      return {
        templateID: template.templateID,
        templateName: template.templateName,
        templateDescription: template.templateDescription,
        templateType: template.templateType,
        createdDate: template.templateCreatedDate,
        modifiedDate: template.templateModifiedDate,
      };
    });

    return {
      statusCode: 200,
      message: "Success",
      data: remappedTemplates,
    };
  } catch (error) {
    console.error("Error fetching document templates:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error.",
    };
  }
});
