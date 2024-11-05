export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    const { guideChatID } = getQuery(event);

    if (!guideChatID) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const guideChat = await prisma.guide_chat.findUnique({
      where: {
        guideChatID: parseInt(guideChatID),
        guideChatStatus: {
          not: "DELETED",
        },
      },
      select: {
        guideChatID: true,
        guideChatName: true,
        guideChatDescription: true,
        guideChatModel: true,
        guideChatType: true,
        guideChatContext: true,
        guideChatStatus: true,
      },
    });

    if (!guideChat) {
      return {
        statusCode: 404,
        message: "Not Found",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: guideChat,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
