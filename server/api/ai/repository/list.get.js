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

    const repoList = await prisma.repository.findMany({
      where: {
        repositoryStatus: "ACTIVE",
        project: {
          userID: userID,
        },
      },
      select: {
        repositoryID: true,
        repositoryName: true,
        repositoryContent: true,
        repositoryVersion: true,
        repositoryDescription: true,
      },
    });

    if (repoList.length == 0) {
      return {
        statusCode: 404,
        message: "No repositories found",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: repoList,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
