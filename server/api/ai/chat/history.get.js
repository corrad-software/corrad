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
        threadProviderID: threadID,
        NOT: {
          lookup: {
            lookupID: 4,
          },
        },
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
        chatProviderMessageID: true,
        chatMessage: true,
        chatRole: true,
        chatType: true,
        chatFile: {
          select: {
            file: {
              select: {
                fileName: true,
                fileProviderID: true,
                fileType: true,
                fileOriginalName: true,
                fileURL: true,
              },
            },
          },
        },
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
        chatProviderMessageID: item.chatProviderMessageID,
        content: item.chatMessage,
        sender: item.chatRole,
        type: item.chatType,
        files: item.chatFile
          ? item.chatFile.map((file) => {
              return {
                fileId: file.file.fileName,
                name: file.file.fileName,
                type: file.file.fileType,
                originalName: file.file.fileOriginalName,
                url: file.file.fileURL,
              };
            })
          : [],
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
