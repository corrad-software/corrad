export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    const promptID = parseInt(event.context.params.id);

    const prompt = await prisma.saved_prompt.findUnique({
      where: {
        promptID: promptID,
        userID: userID,
      },
    });

    if (!prompt) {
      return {
        statusCode: 404,
        message: "Prompt not found or you don't have permission to view it",
      };
    }

    return {
      statusCode: 200,
      message: "Prompt retrieved successfully",
      data: prompt,
    };
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
