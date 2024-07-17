import OpenAI from "openai";
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

    const { openaiAssistantID } = getQuery(event);

    if (!openaiAssistantID) {
      return {
        statusCode: 400,
        message: "Bad Request",
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

    // Get ASSISTANT_MODEL
    const openaiAssistantModel = await getConfiguration("ASSISTANT_MODEL");
    console.log("Assistant Model", openaiAssistantModel);
    if (!openaiAssistantModel) {
      return {
        statusCode: 400,
        message: "Please set OpenAI Assistant Model in settings.",
      };
    }

    // Check if openAI API Key valid or not
    const openai = new OpenAI({
      apiKey: openaiAPIKey.configurationValue,
      project: openaiProjectID.configurationValue,
    });

    try {
      await openai.models.list();
      console.log("API KEY VALID");
    } catch (error) {
      console.error("Error: ", error);
      return {
        statusCode: 400,
        message:
          "OpenAI API Key or Project ID is invalid. Please check your settings.",
      };
    }

    const verifyAssistant = await openai.beta.assistants.list();

    // Check if assistant exists or not
    if (!verifyAssistant) {
      return {
        statusCode: 404,
        message: "Assistant Not Found",
      };
    }

    // Search form id to match with openaiAssistantID
    const assistant = verifyAssistant.data.find(
      (assistant) => assistant.id === openaiAssistantID
    );
    console.log("Exist Assistant", assistant);

    if (!assistant) {
      return {
        statusCode: 404,
        message:
          "Assistant Not Found. Please add the assistant first in OpenAI.",
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
