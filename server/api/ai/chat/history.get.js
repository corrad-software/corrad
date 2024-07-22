export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized.",
      };
    }

    const { threadID, projectID } = getQuery(event);

    if (!threadID || !projectID) {
      return {
        statusCode: 400,
        message: "Thread ID and Project ID are required.",
      };
    }

    const thread = await prisma.thread.findUnique({
      where: {
        threadOAIID: threadID,
      },
    });
    if (!thread) {
      return {
        statusCode: 404,
        message: "Thread Not Found.",
      };
    }

    const project = await prisma.project.findUnique({
      where: {
        projectUniqueID: projectID,
      },
    });

    if (!project) {
      return {
        statusCode: 404,
        message: "Project Not Found.",
      };
    }

    const history = await prisma.chat.findMany({
      where: {
        threadID: thread.threadID,
        projectID: project.projectID,
      },
      select: {
        chatMessage: true,
        chatRole: true,
        chatType: true,
      },
      orderBy: {
        chatCreatedDate: "asc",
      },
    });

    if (!history) {
      return {
        statusCode: 404,
        message: "History not found.",
      };
    }

    const remapHistory = history.map((item) => {
      return {
        content: item.chatMessage,
        sender: item.chatRole,
      };
    });

    return {
      statusCode: 200,
      message: "Success",
      data: remapHistory,
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      message: "Internal Server",
    };
  }
});
