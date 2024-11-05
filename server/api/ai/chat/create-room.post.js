import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";

export default defineEventHandler(async (event) => {
  try {
    let threadID = null;
    const { userID } = event.context.user;

    if (userID == null) {
      throw new Error("User ID is required");
    }

    const { type, assistantID, guideChatID } = await readBody(event);
    console.log("type", type);
    console.log("assistantID", assistantID);
    console.log("guideChatID", guideChatID);

    if (type === "ASSISTANT" && !assistantID) {
      throw new Error("Assistant ID is required");
    }

    if (type === "GUIDE_CHAT" && !guideChatID) {
      throw new Error("Guide Chat ID is required");
    }

    if (type === "ASSISTANT" && assistantID) {
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
          threadSourceType: "ASSISTANT",
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
          lookup_thread_providerIDTolookup: {
            connect: {
              lookupID: 16, // 16 = OpenAI
            },
          },
        },
      });

      if (!addThread) {
        throw new Error("Thread not created");
      }

      threadID = openAIThread.id;
    }

    if (type === "GUIDE_CHAT" && guideChatID) {
      const guideChat = await prisma.guide_chat.findUnique({
        where: {
          guideChatID: parseInt(guideChatID),
          guideChatStatus: "ACTIVE",
        },
        select: {
          guideChatID: true,
          guideChatModel: true,
        },
      });

      console.log("guideChat", guideChat);

      if (!guideChat) {
        throw new Error("Guide Chat not found");
      }

      const addThread = await prisma.thread.create({
        data: {
          threadProviderID: `thread_${uuidv4()}`,
          threadSourceType: "GUIDE_CHAT",
          threadCreatedDate: DateTime.now().toISO(),
          guide_chat: {
            connect: {
              guideChatID: guideChat.guideChatID,
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
          lookup_thread_providerIDTolookup: {
            connect: {
              lookupID: guideChat.guideChatModel,
            },
          },
        },
      });

      threadID = addThread.threadProviderID;
    }

    await sendRedirect(event, `/ai/chat/${threadID}`, 302);
  } catch (error) {
    console.log("ERROR => ", error.message);

    await sendRedirect(event, `/ai?errormsg=${error.message}`, 302);
  }
});
