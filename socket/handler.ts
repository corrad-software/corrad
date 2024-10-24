import { Server } from "socket.io";
import { DateTime } from "luxon";

const activeStreams = new Map();
const activeThreads = new Map();

export const socketHandler = async (io: Server) => {
  // Init utils openai
  const { statusCode, data } = await initOpenAI();
  if (statusCode !== 200) {
    console.log("Error initializing OpenAI:");
    throw new Error("Failed to initialize OpenAI");
  }

  const openai = data?.openai;

  io.on("connection", async (socket) => {
    console.log("New client connected");

    socket.on("joinRoom", async (threadID) => {
      socket.join(threadID);
      console.log(`Client joined room: ${threadID}`);

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
      console.log(`Client left room: ${threadID}`);

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
          console.log("documentContext:", documentContext);

          // Check if this socket is the active one for the thread
          if (activeThreads.get(threadID) !== socket.id) {
            console.log(
              `Ignoring message from inactive socket for thread: ${threadID}`
            );
            return;
          }

          io.to(threadID).emit("messageStart");

          // Process user's input
          if (message.content) {
            const userQuery = message.content;

            const messageToSend = `User query: ${userQuery}\n\nRelevant document context:\n${documentContext}\n\nPlease provide a response based on the user's query and the given document context.`;

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
                    threadOAIID: threadID,
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
                    threadOAIID: threadID,
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

            // console.log("Event:", ev);

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
            io.to(threadID).emit(
              "messageError",
              "Run failed or was interrupted"
            );
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

          const createMessageResponse = await prisma?.chat.create({
            data: {
              chatMessage: lastMessage.content[0].text.value,
              chatRole: "assistant",
              chatType: "text",
              chatOAIMessageID: lastMessage.id,
              thread: {
                connect: {
                  threadOAIID: threadID,
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

          console.log("Message created:", createMessageResponse);

          io.to(threadID).emit("messageClear");
        } catch (error) {
          activeStreams.delete(threadID);

          console.error("Error processing message:", error);
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

      console.log("Stopping stream for thread:", activeStream);

      if (activeStream) {
        activeStream.isActive = false;

        // Cancel the run if it's still in progress
        if (activeStream.runId) {
          try {
            await openai?.beta.threads.runs.cancel(
              threadID,
              activeStream.runId
            );
            console.log(`Run cancelled for thread: ${threadID}`);
          } catch (error) {
            console.error("Error cancelling run:", error);
          }
        }

        io.to(threadID).emit("streamStopped");
        activeStreams.delete(threadID);
      }
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
          io.to(threadID).emit("messageStart");

          // Delete the previous assistant message from the database
          await prisma?.chat.deleteMany({
            where: {
              chatOAIMessageID: assistantMessageId,
              thread: {
                threadOAIID: threadID,
              },
              project: {
                projectUniqueID: projectID,
              },
            },
          });

          // Process the message with OpenAI
          await openai?.beta.threads.messages.create(threadID, {
            role: "user",
            content: message.content,
          });

          const stream = await openai?.beta.threads.runs.create(threadID, {
            assistant_id: assistantID,
            stream: true,
          });

          let fullResponse = "";
          let completed = false;

          for await (const ev of stream) {
            console.log("Event:", ev);

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
            io.to(threadID).emit("messageError", "Run failed");
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

          const createMessageResponse = await prisma?.chat.create({
            data: {
              chatMessage: lastMessage.content[0].text.value,
              chatRole: "assistant",
              chatType: "text",
              chatOAIMessageID: lastMessage.id,
              thread: {
                connect: {
                  threadOAIID: threadID,
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

          console.log("Regenerated message created:", createMessageResponse);

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
