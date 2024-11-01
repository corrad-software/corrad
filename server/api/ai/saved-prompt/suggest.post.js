export default defineEventHandler(async (event) => {
  try {
    const { promptContent } = await readBody(event);

    if (!promptContent) {
      return {
        statusCode: 400,
        message: "Prompt content is required for suggestion",
      };
    }

    // Initialize AI providers
    const openAIResponse = await initAI("openai");
    if (openAIResponse.statusCode !== 200) {
      console.error("Error initializing OpenAI:", openAIResponse.message);
      throw new Error("Failed to initialize OpenAI");
    }

    const openai = openAIResponse.data?.provider.getClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: `You are a helpful assistant that improves prompts. The user will provide you with a prompt and you will improve it.
            The improved prompt should be more clear, concise, and effective. The improved prompt should be in the same language as the prompt provided by the user.
            `,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Improve the following prompt:\n\n${promptContent}\n\nImproved prompt:`,
            },
          ],
        },
      ],
    });

    const suggestion = response.choices[0].message.content.trim();

    return {
      statusCode: 200,
      message: "AI suggestion generated successfully",
      data: {
        suggestion: suggestion,
      },
    };
  } catch (error) {
    console.error("Error generating AI suggestion:", error);
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
