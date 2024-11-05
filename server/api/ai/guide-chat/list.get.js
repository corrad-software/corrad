export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    const guideChats = await prisma.guide_chat.findMany({
      where: {
        guideChatStatus: {
          not: "DELETED",
        },
      },
      select: {
        guideChatID: true,
        guideChatName: true,
        guideChatDescription: true,
        guideChatType: true,
        guideChatStatus: true,
        lookup: {
          select: {
            lookupTitle: true,
          },
        },
      },
    });

    if (guideChats.length === 0) {
      return {
        statusCode: 404,
        message: "Not Found",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: guideChats,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
