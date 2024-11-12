export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    const aiAssistants = await prisma.assistant.findMany({
      where: {
        assistantStatus: "ACTIVE",
      },
      select: {
        assistantID: true,
        assistantName: true,
        assistantDescription: true,
        assistantImg: true,
        assistantIcon: true,
        assistantIconColour: true,
        assistantType: true,
      },
    });

    const guideChats = await prisma.guide_chat.findMany({
      where: {
        guideChatStatus: "ACTIVE",
      },
      select: {
        guideChatID: true,
        guideChatName: true,
        guideChatDescription: true,
        guideChatType: true,
        lookup: {
          select: {
            lookupTitle: true,
          },
        },
      },
    });

    let remapGuideChats = guideChats.map((chat) => ({
      guideChatID: chat.guideChatID,
      guideChatName: chat.guideChatName,
      guideChatDescription: chat.guideChatDescription,
      guideChatType: chat.guideChatType,
      guideChatModel: chat.lookup.lookupTitle,
    }));

    return {
      statusCode: 200,
      message: "Success",
      data: {
        assistants: aiAssistants,
        guideChats: remapGuideChats,
      },
    };
  } catch (error) {
    console.log("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
