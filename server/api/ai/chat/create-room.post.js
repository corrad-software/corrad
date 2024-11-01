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

    // Initialize AI providers
    const openAIResponse = await initAI("openai");
    if (openAIResponse.statusCode !== 200) {
      console.error("Error initializing OpenAI:", openAIResponse.message);
      throw new Error("Failed to initialize OpenAI");
    }

    const openai = openAIResponse.data?.provider.getClient();

    // Create thread empty
    const openAIThread = await openai.beta.threads.create();
    console.log("openAIThread", openAIThread);
    if (!openAIThread?.id) {
      throw new Error("Thread not created");
    }

    const addThread = await prisma.thread.create({
      data: {
        threadProviderID: openAIThread.id,
        threadCreatedDate: DateTime.now().toISO(),
        assistant: {
          connect: {
            assistantID: assistant.assistantID,
          },
        },
        user: {
          connect: {
            userID: userID,
          },
        },
        lookup: {
          connect: {
            lookupID: 2, // 2 = Active
          },
        },
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
