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
      guideChatName,
      guideChatDescription,
      guideChatModel,
      guideChatType,
      guideChatContext,
      guideChatStatus,
    } = await readBody(event);

    if (!guideChatName || !guideChatModel || !guideChatStatus) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const addGuideChat = await prisma.guide_chat.create({
      data: {
        guideChatName,
        guideChatDescription: guideChatDescription || undefined,
        guideChatModel: parseInt(guideChatModel),
        guideChatType: guideChatType || undefined,
        guideChatContext: guideChatContext || undefined,
        guideChatStatus,
        guideChatCreatedDate: DateTime.now(),
      },
    });

    if (!addGuideChat) {
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
