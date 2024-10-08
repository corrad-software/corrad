import { Server } from "socket.io";
import { DateTime } from "luxon";
import fs from "fs";
import path from "path";

const MAX_CHUNK_LENGTH = 100000;
const activeStreams = new Map();

function splitMessageIntoChunks(message) {
  const chunks = [];
  let currentChunk = "";

  message.split("\n").forEach((line) => {
    if (currentChunk.length + line.length + 1 > MAX_CHUNK_LENGTH) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
    currentChunk += (currentChunk ? "\n" : "") + line;
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export const socketHandler = async (io: Server) => {
  const fileChunks = new Map();

  // Init utils openai
  const { statusCode, data } = await initOpenAI();
  if (statusCode !== 200) {
    console.log("Error initializing OpenAI:");
    throw new Error("Failed to initialize OpenAI");
  }

  const openai = data?.openai;

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

    socket.on("fileChunk", (data, callback) => {
      const { fileId, fileName, chunkIndex, totalChunks, chunk } = data;

      if (!fileChunks.has(fileId)) {
        fileChunks.set(fileId, []);
      }

      fileChunks.get(fileId)[chunkIndex] = chunk;

      if (fileChunks.get(fileId).filter(Boolean).length === totalChunks) {
        const fullFile = Buffer.concat(
          fileChunks.get(fileId).map((chunk) => Buffer.from(chunk, "base64"))
        );
        const filePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          fileName
        );

        // If the uploads directory doesn't exist, create it
        if (!fs.existsSync(path.join(process.cwd(), "public", "uploads"))) {
          fs.mkdirSync(path.join(process.cwd(), "public", "uploads"), {
            recursive: true,
          });
        }

        fs.writeFileSync(filePath, fullFile);
        fileChunks.delete(fileId);
      }

      callback();
    });

    socket.on(
      "sendMessage",
      async ({ threadID, assistantID, projectID, user, message }) => {
        try {
          io.to(threadID).emit("messageStart");

          let fileAttachments = [];
          if (message.files && message.files.length > 0) {
            fileAttachments = await Promise.all(
              message.files.map(async (file) => {
                const fileExtension = file.name.split(".").pop().toLowerCase();
                const isImage = ["jpg", "jpeg", "png", "gif"].includes(
                  fileExtension
                );

                if (isImage) {
                  // For images, we don't need to upload to OpenAI
                  return null;
                }

                const uploadFile = await openai?.files.create({
                  file: fs.createReadStream(
                    path.join(process.cwd(), "public", "uploads", file.name)
                  ),
                  purpose: "assistants",
                });

                console.log("File uploaded:", uploadFile);

                if (uploadFile?.id) {
                  const createFileChat = await prisma?.chat.create({
                    select: {
                      chatID: true,
                    },
                    data: {
                      chatMessage: file.name,
                      chatRole: message.sender,
                      chatType: "file",
                      chatFile: {
                        create: {
                          file: {
                            create: {
                              fileName: file.name,
                              fileURL: file.url,
                              fileBytes: uploadFile.bytes,
                              fileOAIID: uploadFile.id,
                              fileType: file.type,
                              fileCreatedDate: DateTime.now().toISO(),
                              fileOriginalName: file.originalName,
                            },
                          },
                        },
                      },
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

                  if (!createFileChat) {
                    return null;
                  }

                  return {
                    id: file.fileId,
                    name: file.name,
                    url: file.url,
                    openAIFileId: uploadFile.id,
                    bytes: uploadFile.bytes,
                  };
                }

                return null;
              })
            );

            fileAttachments = fileAttachments.filter(Boolean);
          }

          const getFiles = await prisma?.chat.findMany({
            where: {
              thread: {
                threadOAIID: threadID,
              },
              chatType: "file",
            },
            select: {
              chatFile: {
                select: {
                  file: {
                    select: {
                      fileOAIID: true,
                    },
                  },
                },
              },
            },
          });

          let arrayAttachments = [];

          if (getFiles && getFiles.length > 0) {
            arrayAttachments = getFiles
              .map((file) => {
                if (!file.chatFile[0].file.fileOAIID) return null;

                return {
                  file_id: file.chatFile[0].file.fileOAIID,
                  tools: [
                    {
                      type: "file_search",
                    },
                  ],
                };
              })
              .filter(Boolean);
          }

          console.log("Attachments:", arrayAttachments);

          if (message.content) {
            const messageChunks = splitMessageIntoChunks(message.content);

            for (let i = 0; i < messageChunks.length; i++) {
              const chunk = messageChunks[i];

              // Create a message in db for each chunk
              await prisma?.chat.create({
                data: {
                  chatMessage: chunk,
                  chatRole: message.sender,
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

              // Process each chunk
              await openai?.beta.threads.messages.create(threadID, {
                role: message.sender,
                content: chunk,
                // Remove attachments for OpenAI API call
                // attachments: arrayAttachments,
              });
            }
          }

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
              // Delete latest message
              throw new Error("Run failed");
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

          console.log("Message created:", createMessageResponse);

          io.to(threadID).emit("messageClear");
        } catch (error) {
          activeStreams.delete(threadID);

          console.error("Error processing message:", error);
          io.to(threadID).emit(
            "messageError",
            "Something went wrong. Please try again."
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
          console.log("masuk");

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
              throw new Error("Run failed");
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
            "Failed to regenerate response. Please try again."
          );
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
