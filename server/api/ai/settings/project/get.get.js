export default defineEventHandler(async (event) => {
  try {
  } catch (error) {
    console.log("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
