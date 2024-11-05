import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";

const ENV = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      return {
        statusCode: 400,
        message: "No file uploaded",
      };
    }

    const file = formData[0];
    const projectID = formData
      .find((field) => field.name === "projectID")
      ?.data.toString();
    let collectionName = formData
      .find((field) => field.name === "collectionName")
      ?.data.toString();

    if (!projectID) {
      return {
        statusCode: 400,
        message: "Project ID is required",
      };
    }

    const getProjectID = await prisma.project.findFirst({
      where: {
        projectUniqueID: projectID,
      },
    });

    if (!getProjectID) {
      return {
        statusCode: 400,
        message: "Project ID is invalid",
      };
    }

    const fileExtension = path.extname(file.filename).toLowerCase();
    const allowedExtensions = [
      ".docx",
      ".doc",
      ".odt",
      ".rtf",
      ".pdf",
      ".html",
      ".htm",
      ".txt",
      ".epub",
      ".md",
      ".csv",
      ".xls",
      ".xlsx",
    ];

    if (!allowedExtensions.includes(fileExtension)) {
      return {
        statusCode: 400,
        message: "Unsupported file format. Supported formats: " + allowedExtensions.join(", "),
      };
    }

    // Process the file and extract text using Tika server
    let extractedText = "";
    try {
      const response = await fetch(ENV.apacheTika.url + "/tika", {
        method: "PUT",
        body: file.data,
        headers: {
          "Content-Type": "application/octet-stream",
          Accept: "text/plain",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Read the response body as text
      extractedText = await response.text();

      console.log(
        "Extracted Text (first 100 characters):",
        extractedText.substring(0, 100)
      );
    } catch (error) {
      console.error("Tika extraction error:", error);
      return {
        statusCode: 200,
        message: "Document uploaded and embedded successfully",
        data: {
          itemID: "",
          itemName: "",
          collectionName: "",
        },
      };
    }

    // Split the extracted text into chunks
    const chunkSize = 500; // words
    const chunks = splitTextIntoChunks(extractedText, chunkSize);

    // Function to split text into chunks
    function splitTextIntoChunks(text, chunkSize) {
      const words = text.split(/\s+/);
      const chunks = [];
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(" "));
      }
      return chunks;
    }

    // Initialize ChromaDB client
    const client = new ChromaClient({
      path: ENV.chromadb.url,
    });

    // Initialize AI providers
    const openAIResponse = await initAI("openai");
    if (openAIResponse.statusCode !== 200) {
      console.error("Error initializing OpenAI:", openAIResponse.message);
      throw new Error("Failed to initialize OpenAI");
    }

    const openai = openAIResponse.data?.provider.getClient();

    let collection;
    if (collectionName) {
      // Use existing collection
      try {
        collection = await client.getCollection({
          name: collectionName,
          embeddingFunction: new OpenAIEmbeddingFunction({
            openai_api_key: openai.apiKey,
            openai_model: "text-embedding-3-large",
          }),
        });
      } catch (error) {
        console.error("Error getting existing collection:", error);
        return {
          statusCode: 404,
          message: "Specified collection not found",
        };
      }
    } else {
      // Generate a new collection name
      collectionName = `collection_${uuidv4()}`;
      collection = await client.getOrCreateCollection({
        name: collectionName,
        embeddingFunction: new OpenAIEmbeddingFunction({
          openai_api_key: openai.apiKey,
          openai_model: "text-embedding-3-large",
        }),
      });
    }

    // Generate embeddings for each chunk
    const documentIds = chunks.map(() => uuidv4());
    await collection.add({
      ids: documentIds,
      documents: chunks,
      metadatas: chunks.map((_, index) => ({
        filename: file.filename,
        fileType: fileExtension.slice(1),
        chunkIndex: index,
        totalChunks: chunks.length,
      })),
    });

    // Save document information to your database
    const savedCollectionItem = await prisma.collection_item.create({
      data: {
        itemUniqueID: documentIds[0], // Use the first chunk's ID as the main document ID
        userID: userID,
        projectID: getProjectID.projectID,
        itemName: file.filename,
        itemType: fileExtension.slice(1),
        itemCollectionName: collectionName,
        itemCreatedDate: DateTime.now().toJSDate(),
        itemModifiedDate: DateTime.now().toJSDate(),
      },
    });

    return {
      statusCode: 200,
      message: "Document uploaded and embedded successfully",
      data: {
        itemID: savedCollectionItem.itemID,
        itemName: savedCollectionItem.itemName,
        collectionName: collectionName,
      },
    };
  } catch (error) {
    console.error("Error uploading and embedding document:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
