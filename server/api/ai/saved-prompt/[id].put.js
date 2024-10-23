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

    const promptID = parseInt(event.context.params.id);

    const { promptTitle, promptContent, promptDescription, promptTags } =
      await readBody(event);

    if (!promptTitle || !promptContent) {
      return {
        statusCode: 400,
        message: "Prompt title and content are required",
      };
    }

    const existingPrompt = await prisma.saved_prompt.findUnique({
      where: {
        promptID: promptID,
        userID: userID,
      },
    });

    if (!existingPrompt) {
      return {
        statusCode: 404,
        message: "Prompt not found or you don't have permission to edit it",
      };
    }

    const updatedPrompt = await prisma.saved_prompt.update({
      where: {
        promptID: promptID,
      },
      data: {
        promptTitle: promptTitle,
        promptContent: promptContent,
        promptDescription: promptDescription || "",
        promptTags: promptTags || "",
        promptModifiedDate: DateTime.now().toJSDate(),
      },
    });

    return {
      statusCode: 200,
      message: "Prompt updated successfully",
      data: {
        promptID: updatedPrompt.promptID,
        promptTitle: updatedPrompt.promptTitle,
      },
    };
  } catch (error) {
    console.error("Error updating prompt:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
