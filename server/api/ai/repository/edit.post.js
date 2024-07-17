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

    const { repoID, repoName, repoVersion, repoDescription, repoContent } =
      await readBody(event);

    if (!repoID || !repoName || !repoVersion || !repoContent) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const editRepo = await prisma.repository.update({
      where: {
        repositoryID: parseInt(repoID),
      },
      data: {
        repositoryName: repoName,
        repositoryVersion: repoVersion,
        repositoryDescription: repoDescription,
        repositoryContent: repoContent,
        repositoryModifiedDate: DateTime.now(),
      },
    });

    if (!editRepo) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
