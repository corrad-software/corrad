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

    let MAX_RESULTS = await getConfiguration("Chroma_Max_Result");
    if (!MAX_RESULTS) MAX_RESULTS = 5;

    // Search the collection
    const results = await collection.query({
      queryTexts: [query],
      nResults: MAX_RESULTS,
      include: ["documents", "metadatas", "distances"],
    });

    // Map and sort results by distance (lower distance = higher relevance)
    const searchResults = results.documents[0]
      .map((document, index) => ({
        content: document,
        metadata: results.metadatas[0][index],
        score: 1 - results.distances[0][index], // Convert distance to similarity score
      }))
      .sort((a, b) => b.score - a.score); // Sort by score in descending order

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

const getConfiguration = async (configurationCode) => {
  try {
    const value = await prisma.configuration.findFirst({
      where: {
        configurationCode: configurationCode,
        configurationValue: {
          not: null,
        },
      },
      select: {
        configurationValue: true,
      },
    });

    return value?.configurationValue;
  } catch (error) {
    return null;
  }
};
