import { ChromaClient } from "chromadb";

const ENV = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    // const { userID } = event.context.user;

    // if (!userID) {
    //   return { statusCode: 401, message: "Unauthorized" };
    // }

    // Initialize ChromaDB client
    const client = new ChromaClient({ path: ENV.chromadb.url });

    const selectCollection = await prisma.collection_item.findMany();

    if (selectCollection.length > 0) {
      for (let i = 0; i < selectCollection.length; i++) {
        const item = selectCollection[i];
        const collection = await client.getCollection({
          name: item.itemCollectionName,
        });

        // Delete all embeddings
        await client.deleteCollection(collection);

        await prisma.collection_item.deleteMany();
      }
    }

    return {
      statusCode: 200,
      message: "All document embeddings have been deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting document embeddings:", error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
});
