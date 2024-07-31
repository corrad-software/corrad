export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized.",
      };
    }

    const { projectID } = getQuery(event);
    if (!projectID) {
      return {
        statusCode: 400,
        message: "Project ID is required.",
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

    // Chat group by threadID
    const list = await prisma.chat.findMany({
      where: {
        projectID: project.projectID,
        chatRole: "assistant",
        NOT: {
          thread: {
            lookup: {
              lookupID: 4,
            },
          },
        },
      },
      select: {
        projectID: true,
        chatMessage: true,
        thread: {
          select: {
            threadTitle: true,
            threadOAIID: true,
            assistant: {
              select: {
                assistantName: true,
                assistantImg: true,
                assistantID: true,
              },
            },
          },
        },
      },
      distinct: ["threadID"],
    });

    if (!list) {
      return {
        statusCode: 404,
        message: "List Not Found.",
      };
    }

    const remapList = list.map((item) => {
      return {
        threadTitle: item.thread.threadTitle
          ? item.thread.threadTitle
          : item.chatMessage,
        threadID: item.thread.threadOAIID,
        assistantName: item.thread.assistant.assistantName,
        assistantImg: item.thread.assistant.assistantImg,
      };
    });

    return {
      statusCode: 200,
      message: "Success",
      data: remapList,
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      message: "Internal Server Error.",
    };
  }
});
