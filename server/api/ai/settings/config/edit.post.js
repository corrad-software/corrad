export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    const { APIKey, projectID } = await readBody(event);

    if (!APIKey || !projectID) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    const updateConfig = await prisma.configuration.update({
      where: {
        configurationCode: "OPENAI_API_KEY",
      },
      data: {
        configurationValue: APIKey,
      },
    });

    if (!updateConfig) {
      return {
        statusCode: 400,
        message: "Failed to update OpenAI API Key",
      };
    }

    const updateProjectID = await prisma.configuration.update({
      where: {
        configurationCode: "OPENAI_PROJECT_ID",
      },
      data: {
        configurationValue: projectID,
      },
    });

    if (!updateProjectID) {
      return {
        statusCode: 400,
        message: "Failed to update OpenAI Project ID",
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
