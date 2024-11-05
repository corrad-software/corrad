export default defineEventHandler(async (event) => {
  try {
    const models = await getLookupList("15");

    if (!models) {
      throw createError({
        statusCode: 404,
        message: "No models found",
      });
    }

    return {
      statusCode: 200,
      message: "Success",
      data: models,
    };
  } catch (error) {
    console.error("Error fetching AI models:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
