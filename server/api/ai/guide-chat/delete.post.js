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

    const { guideChatID } = await readBody(event);

    if (!guideChatID) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const deleteGuideChat = await prisma.guide_chat.update({
      where: {
        guideChatID: guideChatID,
      },
      data: {
        guideChatStatus: "DELETED",
        guideChatModifiedDate: DateTime.now(),
      },
    });

    if (!deleteGuideChat) {
      return {
        statusCode: 400,
        message: "Failed to delete guide chat",
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
