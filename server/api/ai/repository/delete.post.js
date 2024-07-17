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

    const { repoID } = await readBody(event);

    if (!repoID) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const deleteRepo = await prisma.repository.update({
      where: {
        repositoryID: parseInt(repoID),
      },
      data: {
        repositoryStatus: "DELETED",
        repositoryModifiedDate: DateTime.now(),
      },
    });

    if (!deleteRepo) {
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
