import { Server } from "socket.io";
import { DateTime } from "luxon";
import fs from "fs";
import path from "path";
import CryptoJS from "crypto-js";

export const socketHandler = async (io: Server) => {
  const fileChunks = new Map();

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

          // Init utils openai
          const { statusCode, data } = await initOpenAI();
          if (statusCode !== 200) {
            console.log("Error initializing OpenAI:");
          }

          const openai = data?.openai;

          let fileAttachments = [];
          if (message.files && message.files.length > 0) {
            fileAttachments = await Promise.all(
              message.files.map(async (file) => {
                // Check file extension from the file name
                const fileExtension = file.name.split(".").pop();

                // Determine whether the file is an image or not
                const isImage = ["jpg", "jpeg", "png", "gif"].includes(
                  fileExtension
                );

                const uploadFile = await openai?.files.create({
                  file: fs.createReadStream(
                    path.join(process.cwd(), "public", "uploads", file.name)
                  ),
                  purpose: isImage ? "vision" : "assistants",
                });

                console.log("File uploaded:", uploadFile);

                if (uploadFile?.id) {
                  // Create a chat entry for the file
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

          if (message.content) {
            // Create a message in db
            const createMessage = await prisma?.chat.create({
              data: {
                chatMessage: message.content,
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

            console.log("Message created:", createMessage);
          }

          // Select all file for this thread
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
            arrayAttachments = getFiles.map((file) => {
              if (!file.chatFile[0].file.fileOAIID) return null;

              return {
                file_id: file.chatFile[0].file.fileOAIID,
                tools: [
                  {
                    type: "file_search",
                  },
                ],
              };
            });
          }

          console.log("Attachments:", arrayAttachments);

          // Process the message
          const createMsg = await openai?.beta.threads.messages.create(
            threadID,
            {
              role: message.sender,
              content: message.content,
              attachments: arrayAttachments,
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
              chatType: "text",
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

          io.to(threadID).emit("messageClear");
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
