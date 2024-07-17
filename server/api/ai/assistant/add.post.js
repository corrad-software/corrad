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
      assistantImg,
      assistantName,
      assistantDescription,
      assistantOAIID,
      assistantStatus,
      assistantVerified,
    } = await readBody(event);

    if (!assistantName || !assistantOAIID || !assistantStatus) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const addAssistant = await prisma.assistant.create({
      data: {
        assistantName: assistantName,
        assistantDescription: assistantDescription || undefined,
        assistantImg: assistantImg || undefined,
        assistantOAIID: assistantOAIID,
        assistantStatus: assistantStatus,
        assistantVerified: assistantVerified ? true : false,
        assistantCreatedDate: DateTime.now(),
      },
    });

    if (!addAssistant) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    return {
      statusCode: 200,
      message: "Created",
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
