import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      throw new Error("User ID is required");
    }

    const { assistantID } = await readBody(event);
    console.log("assistantID", assistantID);

    if (!assistantID) {
      throw new Error("Assistant ID is required");
    }

    // Verify that the assistant exists
    const assistant = await prisma.assistant.findUnique({
      where: {
        assistantID: parseInt(assistantID),
      },
    });

    if (!assistant) {
      throw new Error("Assistant not found");
    }

    // Init utils openai
    const { statusCode, message, data } = await initOpenAI();
    if (statusCode !== 200) {
      return {
        statusCode: statusCode,
        message: message,
      };
    }

    const openai = data.openai;

    // Create thread empty
    const openAIThread = await openai.beta.threads.create();
    console.log("openAIThread", openAIThread);
    if (!openAIThread?.id) {
      throw new Error("Thread not created");
    }

    const addThread = await prisma.thread.create({
      data: {
        userID: userID,
        assistantID: assistant.assistantID,
        threadCreatedDate: DateTime.now().toISO(),
        threadOAIID: openAIThread.id,
      },
    });

    console.log("addThread", addThread);

    if (!addThread) {
      throw new Error("Thread not created");
    }

    await sendRedirect(event, `/ai/chat/${openAIThread.id}`, 302);
  } catch (error) {
    console.log("ERROR => ", error.message);

    await sendRedirect(event, `/ai?errormsg=${error.message}`, 302);
  }
});
