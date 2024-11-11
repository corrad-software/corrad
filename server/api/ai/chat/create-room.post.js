import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (!userID) {
      return {
        statusCode: 400,
        error: "User ID is required",
      };
    }

    const { type, assistantID, guideChatID } = await readBody(event);

    // Validate required fields based on type
    if (type === "ASSISTANT" && !assistantID) {
      return {
        statusCode: 400,
        error: "Assistant ID is required",
      };
    }

    if (type === "GUIDE_CHAT" && !guideChatID) {
      return {
        statusCode: 400,
        error: "Guide Chat ID is required",
      };
    }

    let threadID = null;
    let thread = null;

    // Handle Assistant type chat creation
    if (type === "ASSISTANT") {
      // Verify assistant exists and is active
      const assistant = await prisma.assistant.findUnique({
        where: {
          assistantID: parseInt(assistantID),
          assistantStatus: "ACTIVE",
        },
      });

      if (!assistant) {
        return {
          statusCode: 404,
          error: "Assistant not found or inactive",
        };
      }

      // Initialize OpenAI
      const openAIResponse = await initAI("openai");
      if (openAIResponse.statusCode !== 200) {
        console.error("Error initializing OpenAI:", openAIResponse.message);
        return {
          statusCode: 500,
          error: "Failed to initialize OpenAI",
        };
      }

      const openai = openAIResponse.data?.provider.getClient();

      // Create OpenAI thread
      const openAIThread = await openai.beta.threads.create();
      if (!openAIThread?.id) {
        return {
          statusCode: 500,
          error: "Failed to create OpenAI thread",
        };
      }

      // Create thread in database
      thread = await prisma.thread.create({
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
              lookupID: 2, // Active status
            },
          },
          lookup_thread_providerIDTolookup: {
            connect: {
              lookupID: 16, // OpenAI provider
            },
          },
        },
        include: {
          assistant: true,
          user: true,
        },
      });

      threadID = openAIThread.id;
    }

    // Handle Guide Chat type creation
    if (type === "GUIDE_CHAT") {
      const guideChat = await prisma.guide_chat.findUnique({
        where: {
          guideChatID: parseInt(guideChatID),
          guideChatStatus: "ACTIVE",
        },
        select: {
          guideChatID: true,
          guideChatModel: true,
          guideChatName: true,
        },
      });

      if (!guideChat) {
        return {
          statusCode: 404,
          error: "Guide Chat not found or inactive",
        };
      }

      // Create thread for guide chat
      thread = await prisma.thread.create({
        data: {
          threadProviderID: `thread_${uuidv4()}`,
          threadSourceType: "GUIDE_CHAT",
          threadTitle: guideChat.guideChatName,
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
              lookupID: 2, // Active status
            },
          },
          lookup_thread_providerIDTolookup: {
            connect: {
              lookupID: guideChat.guideChatModel,
            },
          },
        },
        include: {
          guide_chat: true,
          user: true,
        },
      });

      threadID = thread.threadProviderID;
    }

    if (!thread) {
      return {
        statusCode: 500,
        error: "Failed to create thread",
      };
    }

    // Return success response with thread details
    return {
      statusCode: 200,
      data: {
        threadID,
      },
    };
  } catch (error) {
    console.error("Error creating chat room:", error);

    return {
      statusCode: 500,
      error: error.message || "An error occurred while creating the chat room",
    };
  }
});
