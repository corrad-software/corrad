export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Body:", body);

  // Parse the body if it's a string with a specific format
  const parsedBody = typeof body === 'string' 
    ? parseCustomFormat(body) 
    : body;

  return {
    statusCode: 200,
    message: "API Route Created",
    data: parsedBody,
  };
});

function parseCustomFormat(str) {
  // Remove leading and trailing curly braces and split by commas
  const pairs = str.trim().slice(1, -1).split(',');
  const result = {};

  pairs.forEach(pair => {
    const [key, value] = pair.split(':').map(s => s.trim());
    // Remove quotes from the value if present
    result[key] = value.startsWith('"') && value.endsWith('"') 
      ? value.slice(1, -1) 
      : value;
  });

  return result;
}
