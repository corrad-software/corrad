export default defineEventHandler(async (event) => {
  try {
    const { documentationID } = getQuery(event);

    if (!documentationID) {
      return {
        statusCode: 400,
        message: "Bad Request - Documentation ID is required",
      };
    }

    const documentation = await prisma.documentation.findUnique({
      where: {
        documentationID: parseInt(documentationID),
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
      message: "Success",
      data: documentation,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
