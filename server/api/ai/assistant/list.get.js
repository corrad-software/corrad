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

    const assistants = await prisma.assistant.findMany({
      where: {
        assistantStatus: {
          not: "DELETED",
        },
      },
      select: {
        assistantID: true,
        assistantImg: true,
        assistantName: true,
        assistantDescription: true,
        assistantStatus: true,
        assistantVerified: true,
      },
    });

    if (assistants.length === 0) {
      return {
        statusCode: 404,
        message: "Not Found",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: assistants,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
