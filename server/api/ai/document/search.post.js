import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";

const ENV = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    let { query, collectionName } = await readBody(event);

    if (!userID) {
      return { statusCode: 401, message: "Unauthorized" };
    }

    if (!collectionName) {
      return { statusCode: 400, message: "Collection name is required" };
    }

    // Initialize ChromaDB client
    const client = new ChromaClient({ path: ENV.chromadb.url });

    // Initialize AI providers
    const openAIResponse = await initAI("openai");
    if (openAIResponse.statusCode !== 200) {
      console.error("Error initializing OpenAI:", openAIResponse.message);
      throw new Error("Failed to initialize OpenAI");
    }

    const openai = openAIResponse.data?.provider.getClient();

    let collection;
    try {
      collection = await client.getCollection({
        name: collectionName,
        embeddingFunction: new OpenAIEmbeddingFunction({
          openai_api_key: openai.apiKey,
          openai_model: "text-embedding-3-large",
        }),
      });
    } catch (error) {
      return {
        statusCode: 404,
        message: "Collection not found",
        data: [],
      };
    }

    if (!query)
      query = "Give me the summary of the documents from this collections.";

    // Search the collection
    const results = await collection.query({
      queryTexts: [query],
      nResults: 2,
      include: ["documents", "metadatas"],
    });

    const searchResults = results.documents[0].map((document, index) => ({
      content: document,
      metadata: results.metadatas[0][index],
    }));

    return {
      statusCode: 200,
      message: "Search completed successfully",
      data: searchResults,
    };
  } catch (error) {
    console.error("Error searching documents:", error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
});
