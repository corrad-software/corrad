export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    const documentationID = parseInt(event.context.params.id);

    const documentation = await prisma.documentation.findUnique({
      where: {
        documentationID: documentationID,
      },
    });

    if (!documentation) {
      return {
        statusCode: 404,
        message: "Documentation not found",
      };
    }

    return {
      statusCode: 200,
      message: "Documentation retrieved successfully",
      data: documentation,
    };
  } catch (error) {
    console.error("Error fetching documentation:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
