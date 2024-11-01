import { ChromaClient } from "chromadb";

const ENV = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    const { threadID, collectionName } = await readBody(event);

    if (!userID) {
      return { statusCode: 401, message: "Unauthorized" };
    }

    if (!threadID || !collectionName) {
      return {
        statusCode: 400,
        message: "Thread ID and collection name are required",
      };
    }

    // Initialize ChromaDB client
    const client = new ChromaClient({ path: ENV.chromadb.url });

    // Check if the collection exists in ChromaDB
    try {
      await client.getCollection({ name: collectionName });
    } catch (error) {
      return { statusCode: 404, message: "Collection not found" };
    }

    // Update the collection name in the thread table
    const updatedThread = await prisma.thread.update({
      where: { threadProviderID: threadID },
      data: { collectionName },
    });

    if (!updatedThread) {
      return { statusCode: 404, message: "Thread not found" };
    }

    return {
      statusCode: 200,
      message: "Thread collection updated successfully",
      data: { threadID, collectionName },
    };
  } catch (error) {
    console.error("Error updating thread collection:", error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
});
