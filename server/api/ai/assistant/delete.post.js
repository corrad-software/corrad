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

    const { assistantID } = await readBody(event);

    if (!assistantID) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const deleteAssistant = await prisma.assistant.update({
      where: {
        assistantID: assistantID,
      },
      data: {
        assistantStatus: "DELETED",
      },
    });

    if (!deleteAssistant) {
      return {
        statusCode: 400,
        message: "Failed to delete assistant",
      };
    }

    return {
      statusCode: 200,
      message: "Deleted",
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
