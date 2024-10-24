import OpenAI from "openai";

const main = async () => {
  try {
    // Check if openAI API key is not null
    const openaiAPIKey = await getConfiguration("OPENAI_API_KEY");
    // console.log("API Key", openaiAPIKey);
    if (!openaiAPIKey) {
      return {
        statusCode: 400,
        message: "Please set OpenAI API Key in settings.",
      };
    }

    // Check if openAI Project ID is not null
    const openaiProjectID = await getConfiguration("OPENAI_PROJECT_ID");
    // console.log("Project ID", openaiProjectID);
    if (!openaiProjectID) {
      return {
        statusCode: 400,
        message: "Please set OpenAI Project ID in settings.",
      };
    }

    // Get ASSISTANT_MODEL
    const openaiAssistantModel = await getConfiguration("ASSISTANT_MODEL");
    // console.log("Assistant Model", openaiAssistantModel);
    if (!openaiAssistantModel) {
      return {
        statusCode: 400,
        message: "Please set OpenAI Assistant Model in settings.",
      };
    }

    // return {
    //   statusCode: 200,
    //   message: "Success",
    //   data: {
    //     APIKey: openaiAPIKey.configurationValue,
    //     projectID: openaiProjectID.configurationValue,
    //     assistantModel: openaiAssistantModel.configurationValue,
    //   },
    // };

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: openaiAPIKey.configurationValue,
      project: openaiProjectID.configurationValue,
    });

    try {
      await openai.models.list();
      // console.log("==== API KEY VALID =====");
      return {
        statusCode: 200,
        message: "Success",
        data: {
          openai: openai,
          APIKey: openaiAPIKey.configurationValue,
          projectID: openaiProjectID.configurationValue,
          assistantModel: openaiAssistantModel.configurationValue,
        },
      };
    } catch (error) {
      console.error("Error: ", error);
      return {
        statusCode: 400,
        message:
          "OpenAI API Key or Project ID is invalid. Please check your settings.",
      };
    }
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 400,
      message: error.message,
    };
  }
};

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

export default main;
