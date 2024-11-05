import { Server } from "socket.io";
import { DateTime } from "luxon";

const activeStreams = new Map();
const activeThreads = new Map();

export const socketHandler = async (io: Server) => {
  // Initialize AI providers
  const openAIResponse = await initAI("openai");
  if (openAIResponse.statusCode !== 200) {
    console.error("Error initializing OpenAI:", openAIResponse.message);
    throw new Error("Failed to initialize OpenAI");
  }

  const openai = openAIResponse.data?.provider.getClient();

  io.on("connection", async (socket) => {
    // console.log("New client connected");

    socket.on("joinRoom", async (threadID) => {
      socket.join(threadID);
      // console.log(`Client joined room: ${threadID}`);

      // Check if there's an active stream for this thread
      const activeStream = activeStreams.get(threadID);
      if (activeStream) {
        // Cancel the existing run
        try {
          await openai?.beta.threads.runs.cancel(threadID, activeStream.runId);
          console.log(`Cancelled existing run for thread: ${threadID}`);
        } catch (error) {
          console.error("Error cancelling run:", error);
        }

        // Clear the active stream
        activeStreams.delete(threadID);

        // Emit an event to inform the client that the previous stream was stopped
        io.to(threadID).emit("previousStreamStopped");
      }

      // Set the active thread
      activeThreads.set(threadID, socket.id);
    });

    socket.on("leaveRoom", (threadID) => {
      socket.leave(threadID);
      // console.log(`Client left room: ${threadID}`);

      // Remove the active thread
      if (activeThreads.get(threadID) === socket.id) {
        activeThreads.delete(threadID);
      }
    });

    socket.on(
      "sendMessage",
      async ({
        threadID,
        assistantID,
        projectID,
        user,
        message,
        selectedPrompt,
        documentContext,
      }) => {
        try {
          // Check thread source type and provider
          const thread = await prisma?.thread.findFirst({
            where: { threadProviderID: threadID },
            include: {
              lookup_thread_providerIDTolookup: true,
            },
          });

          if (!thread) {
            throw new Error("Thread not found");
          }

          // Handle different thread types
          if (thread.threadSourceType === "ASSISTANT") {
            // Existing OpenAI Assistant logic
            await handleOpenAIAssistant({
              socket,
              io,
              threadID,
              assistantID,
              projectID,
              user,
              message,
              selectedPrompt,
              documentContext,
            });
          } else if (thread.threadSourceType === "GUIDE_CHAT") {
            const provider = thread.lookup_thread_providerIDTolookup;

            if (!provider) {
              throw new Error("Provider not found for guide chat");
            }

            if (provider.lookupValue === "openai") {
              await handleOpenAIChat({
                socket,
                io,
                threadID,
                projectID,
                user,
                message,
                selectedPrompt,
                documentContext,
              });
            } else if (provider.lookupValue === "claude") {
              await handleClaudeChat({
                socket,
                io,
                threadID,
                projectID,
                user,
                message,
                selectedPrompt,
                documentContext,
              });
            }
          }
        } catch (error) {
          console.error("Error in message handling:", error);
          io.to(threadID).emit(
            "messageError",
            error.message || "Something went wrong. Please try again."
          );
        }
      }
    );

    // Updated event listener for stopping the stream
    socket.on("stopStream", async (threadID) => {
      const activeStream = activeStreams.get(threadID);
      console.log("Stopping stream for thread:", threadID);

      if (activeStream) {
        // Mark stream as inactive
        activeStream.isActive = false;

        // Cancel the run if it's an OpenAI assistant stream
        const runId = activeStream.runId;
        if (runId) {
          try {
            await openai?.beta.threads.runs.cancel(threadID, runId);
            console.log(`Run cancelled for thread: ${threadID}`);
          } catch (error) {
            console.error("Error cancelling run:", error);
          }
        }

        activeStreams.delete(threadID);
      }

      io.to(threadID).emit("streamStopped");
    });

    socket.on(
      "regenerateResponse",
      async ({
        threadID,
        assistantID,
        projectID,
        user,
        message,
        assistantMessageId,
      }) => {
        try {
          // Check thread source type and provider
          const thread = await prisma?.thread.findFirst({
            where: { threadProviderID: threadID },
            include: {
              lookup_thread_providerIDTolookup: true,
            },
          });

          if (!thread) {
            throw new Error("Thread not found");
          }

          // Delete the previous assistant message from the database
          await prisma?.chat.deleteMany({
            where: {
              chatProviderMessageID: assistantMessageId,
              thread: {
                threadProviderID: threadID,
              },
              project: {
                projectUniqueID: projectID,
              },
            },
          });

          // Handle different thread types
          if (thread.threadSourceType === "ASSISTANT") {
            await handleOpenAIAssistant({
              socket,
              io,
              threadID,
              assistantID,
              projectID,
              user,
              message,
              selectedPrompt: null,
              documentContext: null,
            });
          } else if (thread.threadSourceType === "GUIDE_CHAT") {
            const provider = thread.lookup_thread_providerIDTolookup;

            if (!provider) {
              throw new Error("Provider not found for guide chat");
            }

            if (provider.lookupValue === "openai") {
              await handleOpenAIChat({
                socket,
                io,
                threadID,
                projectID,
                user,
                message,
                selectedPrompt: null,
                documentContext: null,
              });
            } else if (provider.lookupValue === "claude") {
              await handleClaudeChat({
                socket,
                io,
                threadID,
                projectID,
                user,
                message,
                selectedPrompt: null,
                documentContext: null,
              });
            }
          }

          io.to(threadID).emit("messageClear");
        } catch (error) {
          console.error("Error regenerating response:", error);
          io.to(threadID).emit(
            "messageError",
            error.message || "Failed to regenerate response. Please try again."
          );
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      // Remove any active threads for this socket
      for (const [threadID, socketId] of activeThreads.entries()) {
        if (socketId === socket.id) {
          activeThreads.delete(threadID);
        }
      }
    });
  });
};

// Helper functions for different chat types
async function handleOpenAIAssistant({
  socket,
  io,
  threadID,
  assistantID,
  projectID,
  user,
  message,
  selectedPrompt,
  documentContext,
}) {
  // Initialize AI providers
  const openAIResponse = await initAI("openai");
  if (openAIResponse.statusCode !== 200) {
    console.error("Error initializing OpenAI:", openAIResponse.message);
    throw new Error("Failed to initialize OpenAI");
  }

  const openai = openAIResponse.data?.provider.getClient();

  // Check if this socket is the active one for the thread
  if (activeThreads.get(threadID) !== socket.id) {
    console.log(
      `Ignoring message from inactive socket for thread: ${threadID}`
    );
    return;
  }

  io.to(threadID).emit("messageStart");

  try {
    // Process user's input
    if (message.content) {
      const userQuery = message.content;

      const messageToSend = documentContext
        ? `User query: ${userQuery}\n\nRelevant document context:\n${documentContext}\n\nPlease provide a response based on the user's query and the given document context.`
        : userQuery;
      // Send user's input to OpenAI
      await openai?.beta.threads.messages.create(threadID, {
        role: "user",
        content: messageToSend,
      });

      // Create a message in db for user's input
      await prisma?.chat.create({
        data: {
          chatMessage: userQuery,
          chatRole: "user",
          chatType: "text",
          thread: {
            connect: {
              threadProviderID: threadID,
            },
          },
          user: {
            connect: {
              userUsername: user.username,
            },
          },
          project: {
            connect: {
              projectUniqueID: projectID,
            },
          },
          chatCreatedDate: DateTime.now().toISO(),
        },
      });
    }

    // Handle selected prompt
    if (selectedPrompt) {
      // Create a message in db for the prompt
      await prisma?.chat.create({
        data: {
          chatMessage: selectedPrompt.content,
          chatRole: "user",
          chatType: "prompt",
          thread: {
            connect: {
              threadProviderID: threadID,
            },
          },
          user: {
            connect: {
              userUsername: user.username,
            },
          },
          project: {
            connect: {
              projectUniqueID: projectID,
            },
          },
          chatCreatedDate: DateTime.now().toISO(),
        },
      });

      // Send prompt content to OpenAI
      await openai?.beta.threads.messages.create(threadID, {
        role: "user",
        content: selectedPrompt.content,
      });
    }

    // Generate response from OpenAI (existing code)
    const stream = await openai?.beta.threads.runs.create(threadID, {
      assistant_id: assistantID,
      stream: true,
    });

    let fullResponse = "";
    let completed = false;

    for await (const ev of stream) {
      // Check if this socket is still the active one for the thread
      if (activeThreads.get(threadID) !== socket.id) {
        console.log(
          `Stopping stream for inactive socket in thread: ${threadID}`
        );
        break;
      }

      if (
        ev.event === "thread.run.in_progress" ||
        ev.event === "thread.run.created"
      ) {
        // Add the run to activeStreams
        activeStreams.set(threadID, {
          runId: ev.data.id,
          isActive: true,
        });
      }

      if (ev.event === "thread.message.delta" && ev.data.delta?.content) {
        for (const content of ev.data.delta.content) {
          if (content.type === "text") {
            fullResponse += content.text.value;
            io.to(threadID).emit("messageChunk", content.text.value);
          }
        }
      }

      if (ev.event === "thread.run.completed") {
        completed = true;
        break;
      }

      if (ev.event === "thread.run.failed") {
        throw new Error(ev.data.error || "Run failed");
      }
    }

    // Remove the stream from activeStreams
    activeStreams.delete(threadID);

    if (!completed) {
      io.to(threadID).emit("messageError", "Run failed or was interrupted");
      return;
    }

    const messages = await openai.beta.threads.messages.list(threadID);
    const lastMessage = messages.data[0];
    if (lastMessage.role === "assistant") {
      const finalContent = lastMessage.content[0].text.value;
      if (finalContent !== fullResponse) {
        const remainingContent = finalContent.slice(fullResponse.length);
        io.to(threadID).emit("messageChunk", remainingContent);
      }
    }

    io.to(threadID).emit("messageEnd");

    await prisma?.chat.create({
      data: {
        chatMessage: lastMessage.content[0].text.value,
        chatRole: "assistant",
        chatType: "text",
        chatProviderMessageID: lastMessage.id,
        thread: {
          connect: {
            threadProviderID: threadID,
          },
        },
        project: {
          connect: {
            projectUniqueID: projectID,
          },
        },
        chatCreatedDate: DateTime.now().toISO(),
      },
    });

    const threadDetails = await prisma?.thread.findFirst({
      where: { threadProviderID: threadID },
      select: { assistant: { select: { assistantGenerateQuestion: true } } },
    });

    // console.log("Message created:", createMessageResponse);

    io.to(threadID).emit("messageClear");

    if (
      lastMessage?.content[0]?.text?.value &&
      threadDetails?.assistant?.assistantGenerateQuestion
    ) {
      await generateRelatedQuestions(
        openai,
        message.content,
        lastMessage.content[0].text.value,
        io,
        threadID
      );
    }
  } catch (error) {
    throw error;
  }
}

async function handleOpenAIChat({
  socket,
  io,
  threadID,
  projectID,
  user,
  message,
  selectedPrompt,
  documentContext,
}) {
  const openAIResponse = await initAI("openai");
  if (openAIResponse.statusCode !== 200) {
    console.error("Error initializing OpenAI:", openAIResponse.message);
    throw new Error("Failed to initialize OpenAI");
  }

  const openai = openAIResponse.data?.provider.getClient();
  io.to(threadID).emit("messageStart");

  try {
    // Track active stream
    activeStreams.set(threadID, { isActive: true });

    // Create base chat data
    const baseChatData = {
      thread: { connect: { threadProviderID: threadID } },
      project: { connect: { projectUniqueID: projectID } },
      chatCreatedDate: DateTime.now().toISO(),
    };

    // Handle user message and context
    let messageToSend = "";
    if (message.content) {
      messageToSend = documentContext
        ? `User query: ${message.content}\n\nRelevant document context:\n${documentContext}\n\nPlease provide a response based on the user's query and the given document context.`
        : message.content;

      await prisma?.chat.create({
        data: {
          ...baseChatData,
          chatMessage: message.content,
          chatRole: "user",
          chatType: "text",
          user: { connect: { userUsername: user.username } },
        },
      });
    }

    // Handle selected prompt
    if (selectedPrompt) {
      await prisma?.chat.create({
        data: {
          ...baseChatData,
          chatMessage: selectedPrompt.content,
          chatRole: "user",
          chatType: "prompt",
          user: { connect: { userUsername: user.username } },
        },
      });
    }

    // Get configurations and thread details
    const [openaiConfig, threadDetails] = await Promise.all([
      prisma?.configuration.findFirst({
        where: { configurationCode: "OPENAI_MODEL" },
      }),
      prisma?.thread.findFirst({
        where: { threadProviderID: threadID },
        select: {
          guide_chat: {
            select: { guideChatContext: true, guideChatGenerateQuestion: true },
          },
        },
      }),
    ]);

    // Get conversation history
    const conversationHistory = await prisma?.chat.findMany({
      where: { thread: { threadProviderID: threadID } },
      select: { chatMessage: true, chatRole: true },
      orderBy: { chatCreatedDate: "asc" },
      take: -1, // Get all except last one
      skip: 1, // Skip the last record
    });

    // Build messages array
    const messages = [
      {
        role: "system",
        content: threadDetails?.guide_chat?.guideChatContext || "",
      },
      ...(conversationHistory?.map((item) => ({
        role: item.chatRole,
        content: item.chatMessage,
      })) || []),
      { role: "user", content: messageToSend },
      ...(selectedPrompt
        ? [{ role: "user", content: selectedPrompt.content }]
        : []),
    ];

    // Get chat completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: openaiConfig?.configurationValue,
      messages,
      stream: true,
    });

    // Process the stream
    let fullResponse = "";
    let streamWasStopped = false;
    let messageID = "";
    try {
      for await (const chunk of completion) {
        if (messageID == "") {
          messageID = chunk.id;
        }

        // Check if stream should be stopped
        if (!activeStreams.get(threadID)?.isActive) {
          streamWasStopped = true;
          break; // Break the loop but don't return immediately
        }

        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          io.to(threadID).emit("messageChunk", content);
        }
      }
    } finally {
      activeStreams.delete(threadID);
    }

    // Store assistant response even if stream was stopped
    if (fullResponse) {
      await prisma?.chat.create({
        data: {
          ...baseChatData,
          chatMessage: fullResponse,
          chatRole: "assistant",
          chatType: "text",
          chatProviderMessageID: messageID,
        },
      });
    }

    // Only emit appropriate events based on stream status
    if (streamWasStopped) {
      io.to(threadID).emit("streamStopped");
    } else {
      io.to(threadID).emit("messageEnd");
      io.to(threadID).emit("messageClear");
    }

    if (fullResponse && threadDetails?.guide_chat?.guideChatGenerateQuestion) {
      await generateRelatedQuestions(
        openai,
        messageToSend,
        fullResponse,
        io,
        threadID
      );
    }
  } catch (error) {
    activeStreams.delete(threadID);
    throw error;
  }
}

async function handleClaudeChat({
  socket,
  io,
  threadID,
  projectID,
  user,
  message,
  selectedPrompt,
  documentContext,
}) {
  const claudeResponse = await initAI("claude");
  if (claudeResponse.statusCode !== 200) {
    console.error("Error initializing Claude:", claudeResponse.message);
    throw new Error("Failed to initialize Claude");
  }

  const claude = claudeResponse.data?.provider.getClient();
  io.to(threadID).emit("messageStart");

  try {
    // Track active stream
    activeStreams.set(threadID, { isActive: true });

    // Prepare message content
    const messageToSend = message.content
      ? documentContext
        ? `User query: ${message.content}\n\nRelevant document context:\n${documentContext}\n\nPlease provide a response based on the user's query and the given document context.`
        : message.content
      : "";

    // Create base chat data
    const baseChatData = {
      thread: { connect: { threadProviderID: threadID } },
      project: { connect: { projectUniqueID: projectID } },
      chatCreatedDate: DateTime.now().toISO(),
    };

    // Store user messages
    if (message.content) {
      await prisma?.chat.create({
        data: {
          ...baseChatData,
          chatMessage: message.content,
          chatRole: "user",
          chatType: "text",
          user: { connect: { userUsername: user.username } },
        },
      });
    }

    if (selectedPrompt) {
      await prisma?.chat.create({
        data: {
          ...baseChatData,
          chatMessage: selectedPrompt.content,
          chatRole: "user",
          chatType: "prompt",
          user: { connect: { userUsername: user.username } },
        },
      });
    }

    // Get configurations
    const [claudeModel, claudeMaxTokens, threadDetails] = await Promise.all([
      prisma?.configuration.findFirst({
        where: { configurationCode: "CLAUDE_MODEL" },
      }),
      prisma?.configuration.findFirst({
        where: { configurationCode: "CLAUDE_MAX_TOKENS" },
      }),
      prisma?.thread.findFirst({
        where: { threadProviderID: threadID },
        select: {
          guide_chat: {
            select: { guideChatContext: true, guideChatGenerateQuestion: true },
          },
        },
      }),
    ]);

    // Get conversation history
    const conversationHistory = await prisma?.chat.findMany({
      where: { thread: { threadProviderID: threadID } },
      select: { chatMessage: true, chatRole: true },
      orderBy: { chatCreatedDate: "asc" },
      take: -1, // Get all except last one
      skip: 1, // Skip the last record
    });

    // Build messages array
    const messages = [
      {
        role: "assistant",
        content: threadDetails?.guide_chat?.guideChatContext || "",
      },
      ...(conversationHistory?.map((item) => ({
        role: item.chatRole,
        content: item.chatMessage,
      })) || []),
      { role: "user", content: messageToSend },
      ...(selectedPrompt
        ? [{ role: "user", content: selectedPrompt.content }]
        : []),
    ];

    // Get response from Claude
    const response = await claude.messages.stream({
      model: claudeModel?.configurationValue,
      max_tokens: parseInt(claudeMaxTokens?.configurationValue || "1024"),
      messages,
    });

    // Process the stream
    let fullResponse = "";
    let streamWasStopped = false;
    let messageID = "";
    try {
      for await (const chunk of response) {
        if (chunk.type === "message_start") {
          messageID = chunk.message.id;
        }

        // Check if stream should be stopped
        if (!activeStreams.get(threadID)?.isActive) {
          streamWasStopped = true;
          break; // Break the loop but don't return immediately
        }

        const content = chunk.delta?.text || "";
        if (content) {
          fullResponse += content;
          io.to(threadID).emit("messageChunk", content);
        }
      }
    } finally {
      activeStreams.delete(threadID);
    }

    // Store assistant response even if stream was stopped
    if (fullResponse) {
      await prisma?.chat.create({
        data: {
          ...baseChatData,
          chatMessage: fullResponse,
          chatRole: "assistant",
          chatType: "text",
          chatProviderMessageID: messageID,
        },
      });
    }

    // Only emit appropriate events based on stream status
    if (streamWasStopped) {
      io.to(threadID).emit("streamStopped");
    } else {
      io.to(threadID).emit("messageEnd");
      io.to(threadID).emit("messageClear");
    }

    if (fullResponse && threadDetails?.guide_chat?.guideChatGenerateQuestion) {
      // Initialize OpenAI for question generation
      const openAIResponse = await initAI("openai");
      if (openAIResponse.statusCode === 200) {
        const openai = openAIResponse.data?.provider.getClient();
        await generateRelatedQuestions(
          openai,
          messageToSend,
          fullResponse,
          io,
          threadID
        );
      }
    }
  } catch (error) {
    activeStreams.delete(threadID);
    throw error;
  }
}

async function generateRelatedQuestions(
  openai,
  message,
  assistantResponse,
  io,
  threadID
) {
  try {
    // Emit event to show loading state
    io.to(threadID).emit("generatingQuestions");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates relevant follow-up questions based on the conversation context. Generate questions that help users explore the topic further or clarify previous points.",
        },
        {
          role: "user",
          content: `Previous conversation:\nUser: ${message}\nAssistant: ${assistantResponse}\n\nGenerate related follow-up questions.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "related_questions_response",
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: {
                      type: "string",
                      description: "The follow-up question text",
                    },
                    category: {
                      type: "string",
                      description:
                        "Category of the question (e.g., clarification, exploration, technical, practical)",
                    },
                    relevance: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                      description:
                        "How relevant the question is to the current context",
                    },
                    reasoning: {
                      type: "string",
                      description:
                        "Brief explanation of why this question is relevant",
                    },
                  },
                  required: ["question", "category", "relevance", "reasoning"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    if (completion.choices[0].finish_reason === "length") {
      console.error("Response was truncated due to length limits");
      return;
    }

    const response = completion.choices[0].message;

    if (response.refusal) {
      console.log("Model refused to generate questions:", response.refusal);
      return;
    }

    if (!response.content) {
      throw new Error("No response content received");
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(response.content);
    // console.log("Parsed response:", parsedResponse);

    // Sort questions by relevance
    const sortedQuestions = parsedResponse.questions.sort((a, b) => {
      const relevanceOrder = { high: 3, medium: 2, low: 1 };
      return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
    });

    // Emit the structured questions to the client
    io.to(threadID).emit("relatedQuestions", sortedQuestions);
  } catch (error) {
    console.error("Error generating related questions:", error);
  } finally {
    // Clear loading state
    io.to(threadID).emit("generatingQuestions", false);
  }
}
