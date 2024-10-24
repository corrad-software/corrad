import { ChromaClient } from "chromadb";

const ENV = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (!userID) {
      return { statusCode: 401, message: "Unauthorized" };
    }

    // Initialize ChromaDB client
    const client = new ChromaClient({ path: ENV.chromadb.url });

    // Get all collections
    const collections = await prisma.collection_item.findMany({
      select: {
        itemName: true,
        itemCollectionName: true,
      },
    });

    let remappedCollections = collections.map((collection) => ({
      value: collection.itemCollectionName,
      label: collection.itemName,
    }));
    remappedCollections.unshift({
      value: null,
      label: "Please select collection",
    });

    return {
      statusCode: 200,
      message: "Collections fetched successfully",
      data: remappedCollections,
    };
  } catch (error) {
    console.error("Error fetching collections:", error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
});
