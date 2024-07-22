import { Server } from "socket.io";
import { DateTime } from "luxon";

export const socketHandler = async (io: Server) => {
  io.on("connection", async (socket) => {
    console.log("New client connected");

    socket.on("joinRoom", (threadID) => {
      socket.join(threadID);
      console.log(`Client joined room: ${threadID}`);
    });

    socket.on("leaveRoom", (threadID) => {
      socket.leave(threadID);
      console.log(`Client left room: ${threadID}`);
    });

    socket.on(
      "sendMessage",
      async ({ threadID, assistantID, projectID, user, message }) => {
        try {
          io.to(threadID).emit("messageStart");

          // Create a message in db
          const createMessage = await prisma?.chat.create({
            data: {
              chatMessage: message.content,
              chatRole: message.sender,
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

          console.log("Message created:", createMessage);

          // Init utils openai
          const { statusCode, data } = await initOpenAI();
          if (statusCode !== 200) {
            console.log("Error initializing OpenAI:");
          }

          const openai = data?.openai;

          // Process the message
          const createMsg = await openai?.beta.threads.messages.create(
            threadID,
            {
              role: message.sender,
              content: message.content,
            }
          );

          console.log("Message created:", createMsg);

          const stream = await openai?.beta.threads.runs.create(threadID, {
            assistant_id: assistantID,
            stream: true,
          });

          let fullResponse = "";

          for await (const ev of stream) {
            console.log("Event:", ev);

            if (ev.event === "thread.message.created") {
              // A new message has been created, but content might not be available yet
              continue;
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
              // The run has completed, we can stop streaming
              break;
            }
          }

          // Fetch the final message to ensure we have the complete response
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

          // Insert into db

          const createMessageResponse = await prisma?.chat.create({
            data: {
              chatMessage: lastMessage.content[0].text.value,
              chatRole: "assistant",
              chatOAIMessageID: createMsg?.id,
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
        } catch (error) {
          console.error("Error processing message:", error);
          io.to(threadID).emit(
            "messageError",
            "An error occurred while processing your message."
          );
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
