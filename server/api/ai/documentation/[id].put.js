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

    const documentationID = parseInt(event.context.params.id);
    const { documentationContent } = await readBody(event);

    if (!documentationContent) {
      return {
        statusCode: 400,
        message: "Documentation content is required",
      };
    }

    const existingDocumentation = await prisma.documentation.findUnique({
      where: {
        documentationID: documentationID,
      },
    });

    if (!existingDocumentation) {
      return {
        statusCode: 404,
        message: "Documentation not found",
      };
    }

    const updatedDocumentation = await prisma.documentation.update({
      where: {
        documentationID: documentationID,
      },
      data: {
        documentationContent: documentationContent,
        documentationModifiedDate: DateTime.now().toJSDate(),
      },
    });

    return {
      statusCode: 200,
      message: "Documentation updated successfully",
      data: {
        documentationID: updatedDocumentation.documentationID,
      },
    };
  } catch (error) {
    console.error("Error updating documentation:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
