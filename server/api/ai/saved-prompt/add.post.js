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

    const { promptTitle, promptContent, promptDescription, promptTags } =
      await readBody(event);

    if (!promptTitle || !promptContent) {
      return {
        statusCode: 400,
        message: "Prompt title and content are required",
      };
    }

    const newPrompt = await prisma.saved_prompt.create({
      data: {
        promptTitle: promptTitle,
        promptContent: promptContent,
        promptDescription: promptDescription || "",
        promptTags: promptTags || "",
        promptStatus: "ACTIVE",
        promptCreatedDate: DateTime.now().toJSDate(),
        promptModifiedDate: DateTime.now().toJSDate(),
        user: {
          connect: {
            userID: userID,
          },
        },
      },
    });

    if (!newPrompt) {
      return {
        statusCode: 500,
        message: "Failed to create prompt",
      };
    }

    return {
      statusCode: 200,
      message: "Prompt created successfully",
      data: {
        promptID: newPrompt.promptID,
        promptTitle: newPrompt.promptTitle,
      },
    };
  } catch (error) {
    console.error("Error creating prompt:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
