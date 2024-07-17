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

    const { repoID } = getQuery(event);

    if (!repoID) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const getRepo = await prisma.repository.findUnique({
      where: {
        project: {
          userID: userID,
        },
        repositoryID: parseInt(repoID),
        repositoryStatus: "ACTIVE",
      },
      select: {
        repositoryID: true,
        repositoryName: true,
        repositoryVersion: true,
        repositoryDescription: true,
        repositoryContent: true,
      },
    });

    if (getRepo.length == 0) {
      return {
        statusCode: 404,
        message: "No repositories found",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: getRepo,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
