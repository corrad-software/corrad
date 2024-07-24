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

    // Check if openAI API key is not null
    const openaiAPIKey = await getConfiguration("OPENAI_API_KEY");
    console.log("API Key", openaiAPIKey);
    if (!openaiAPIKey) {
      return {
        statusCode: 400,
        message: "Please set OpenAI API Key in settings.",
      };
    }

    // Check if openAI Project ID is not null
    const openaiProjectID = await getConfiguration("OPENAI_PROJECT_ID");
    console.log("Project ID", openaiProjectID);
    if (!openaiProjectID) {
      return {
        statusCode: 400,
        message: "Please set OpenAI Project ID in settings.",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: {
        APIKey: openaiAPIKey.configurationValue,
        projectID: openaiProjectID.configurationValue,
      },
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});

const getConfiguration = async (configurationCode) => {
  return await prisma.configuration.findFirst({
    where: {
      configurationCode: configurationCode,
      configurationValue: {
        not: null,
      },
    },
    select: {
      configurationValue: true,
    },
  });
};
