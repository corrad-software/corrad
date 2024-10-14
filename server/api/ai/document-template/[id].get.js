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

    const template = await prisma.document_template.findUnique({
      where: {
        templateID: templateID,
        userID: userID,
      },
    });

    if (!template) {
      return {
        statusCode: 404,
        message: "Template not found or you don't have permission to view it",
      };
    }

    return {
      statusCode: 200,
      message: "Template retrieved successfully",
      data: template,
    };
  } catch (error) {
    console.error("Error retrieving template:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
