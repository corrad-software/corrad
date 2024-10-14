export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized.",
      };
    }

    const { templateID } = await readBody(event);

    if (!templateID) {
      return {
        statusCode: 400,
        message: "Template ID is required.",
      };
    }

    const deletedTemplate = await prisma.document_template.update({
      where: {
        templateID: parseInt(templateID),
        userID: userID,
      },
      data: {
        templateStatus: "DELETED",
      },
    });

    if (!deletedTemplate) {
      return {
        statusCode: 404,
        message:
          "Template not found or you don't have permission to delete it.",
      };
    }

    return {
      statusCode: 200,
      message: "Template deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting template:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error.",
    };
  }
});
