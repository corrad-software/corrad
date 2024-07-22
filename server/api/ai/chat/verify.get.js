export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized. Redirect to login.",
      };
    }

    const { threadID } = getQuery(event);

    if (!threadID) {
      return {
        statusCode: 400,
        message: "Thread ID is required. Redirect to dashboard.",
      };
    }

    const thread = await prisma.thread.findUnique({
      where: {
        threadOAIID: threadID,
      },
      select: {
        assistant: {
          select: {
            assistantOAIID: true,
            assistantName: true,
            assistantImg: true,
          },
        },
      },
    });

    if (!thread) {
      return {
        statusCode: 404,
        message: "Thread Not Found. Redirect to dashboard.",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: {
        assistantID: thread?.assistant?.assistantOAIID || null,
        assistantName: thread?.assistant?.assistantName || null,
        assistantImg: thread?.assistant?.assistantImg || null,
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      message: "Internal Server",
    };
  }
});
