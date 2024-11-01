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

    // Initialize AI providers
    const openAIResponse = await initAI("openai");
    if (openAIResponse.statusCode !== 200) {
      console.error("Error initializing OpenAI:", openAIResponse.message);
      throw new Error("Failed to initialize OpenAI");
    }

    const openai = openAIResponse.data?.provider.getClient();

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
      (assistant) => assistant?.id === openaiAssistantID
    );

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
