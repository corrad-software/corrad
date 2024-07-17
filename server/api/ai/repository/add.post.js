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

    const { repoName, repoVersion, repoDescription, repoContent, projectID } =
      await readBody(event);

    if (!repoName || !repoVersion || !repoContent || !projectID) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    // Check if the project exists
    const project = await prisma.project.findUnique({
      where: {
        projectUniqueID: projectID,
      },
    });

    if (!project) {
      return {
        statusCode: 404,
        message: "Project not found",
      };
    }

    const addRepo = await prisma.repository.create({
      data: {
        repositoryName: repoName,
        repositoryVersion: repoVersion,
        repositoryDescription: repoDescription,
        repositoryContent: repoContent,
        repositoryCreatedDate: DateTime.now(),
        repositoryStatus: "ACTIVE",
        project: {
          connect: {
            projectUniqueID: projectID,
          },
        },
      },
    });

    if (!addRepo) {
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
