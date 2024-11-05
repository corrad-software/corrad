export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    // Get AI categories
    const aiCategories = await prisma.lookup.findMany({
      where: {
        lookupRefCode: "8",
      },
      select: {
        lookupID: true,
        lookupTitle: true,
      },
    });

    if (aiCategories.length === 0) {
      return {
        statusCode: 400,
        message: "No AI categories found",
      };
    }

    const aiAssistants = await prisma.assistant.findMany({
      select: {
        assistantID: true,
        assistantName: true,
        assistantDescription: true,
        assistantImg: true,
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

    // Group assistants by category
    let categorizedAssistants = aiCategories.map((category) => ({
      categoryName: category.lookupTitle,
      assistantList: aiAssistants.filter(
        (assistant) => assistant.assistantType === category.lookupID
      ),
    }));

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
        assistants: categorizedAssistants,
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
