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

    const { assistantID } = getQuery(event);

    if (!assistantID) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const assistant = await prisma.assistant.findUnique({
      where: {
        assistantID: parseInt(assistantID),
        assistantStatus: {
          not: "DELETED",
        },
      },
      select: {
        assistantID: true,
        assistantImg: true,
        assistantName: true,
        assistantProviderID: true,
        assistantDescription: true,
        assistantStatus: true,
        assistantVerified: true,
        assistantType: true,
      },
    });

    if (!assistant) {
      return {
        statusCode: 404,
        message: "Not Found",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: assistant,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
