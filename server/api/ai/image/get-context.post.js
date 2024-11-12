const ENV = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { imagePath } = body;

    // Validate input
    if (!imagePath) {
      return {
        statusCode: 400,
        message: "Image path is required",
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
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable assistant specializing in providing detailed, context-sensitive descriptions of images for user manuals and technical documentation. Priority is given to describing screenshots of documents or software interfaces, including text, layout, buttons, and navigational elements. If an image is a diagram (e.g., ERD, flowchart, or sequence diagram) or another type, still provide a thorough description with technical detail, though prioritize elements that might aid a user in understanding functionality, structure, or steps within a system.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please describe this image in detail, focusing on any document or screen layout if present. If it's not a document or screen, still describe all elements clearly for reference.",
            },
            {
              type: "image_url",
              image_url: {
                url: `${ENV.appUrl}${imagePath}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    return {
      statusCode: 200,
      message: "Context generated successfully",
      context: response.choices[0].message.content,
    };
  } catch (error) {
    console.error("Error getting image context:", error);
    return {
      statusCode: 500,
      message: "Failed to generate context",
      error: error.message,
    };
  }
});
