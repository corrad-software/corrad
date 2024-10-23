export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized.",
      };
    }

    const prompts = await prisma.saved_prompt.findMany({
      where: {
        userID: userID,
        promptStatus: "ACTIVE",
      },
      select: {
        promptID: true,
        promptTitle: true,
        promptDescription: true,
        promptContent: true,
        promptTags: true,
        promptCreatedDate: true,
        promptModifiedDate: true,
      },
      orderBy: {
        promptModifiedDate: "desc",
      },
    });

    if (!prompts) {
      return {
        statusCode: 404,
        message: "No prompts found.",
      };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: prompts,
    };
  } catch (error) {
    console.error("Error fetching saved prompts:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error.",
    };
  }
});
