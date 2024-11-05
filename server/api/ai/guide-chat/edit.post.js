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
      guideChatID,
      guideChatName,
      guideChatDescription,
      guideChatModel,
      guideChatType,
      guideChatContext,
      guideChatStatus,
    } = await readBody(event);

    if (!guideChatID || !guideChatName || !guideChatModel || !guideChatStatus) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const editGuideChat = await prisma.guide_chat.update({
      where: {
        guideChatID: parseInt(guideChatID),
      },
      data: {
        guideChatName,
        guideChatDescription: guideChatDescription || undefined,
        guideChatModel: parseInt(guideChatModel),
        guideChatType: guideChatType || undefined,
        guideChatContext: guideChatContext || undefined,
        guideChatStatus,
        guideChatModifiedDate: DateTime.now(),
      },
    });

    if (!editGuideChat) {
      return {
        statusCode: 400,
        message: "Failed to update guide chat",
      };
    }

    return {
      statusCode: 200,
      message: "Updated",
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
