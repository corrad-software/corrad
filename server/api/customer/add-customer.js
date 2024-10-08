export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log("Body:", body)

  return {
    statusCode: 200,
    message: "API Route Created",
    data: parsedBody,
  }
})
