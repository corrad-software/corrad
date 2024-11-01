import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized.",
      };
    }

    const { threadID } = await readBody(event);

    if (!threadID) {
      return {
        statusCode: 400,
        message: "Thread ID is required.",
      };
    }

    const deleteThread = await prisma.thread.update({
      where: {
        threadProviderID: threadID,
      },
      data: {
        lookup: {
          connect: {
            lookupID: 4, // 4 = Deleted
          },
        },
        threadModifiedDate: DateTime.now().toISO(),
      },
    });

    if (!deleteThread) {
      return {
        statusCode: 404,
        message: "Thread not found",
      };
    }

    return {
      statusCode: 200,
      message: "Thread deleted",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: error.message,
    };
  }
});
