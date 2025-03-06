// Helper function to convert BigInt values to numbers
function convertBigIntToNumber(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "bigint") {
    return Number(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertBigIntToNumber(item));
  }

  if (typeof data === "object" && data !== null) {
    const result = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertBigIntToNumber(data[key]);
      }
    }
    return result;
  }

  return data;
}

export default defineEventHandler(async (event) => {
  try {
    // Check if user is authenticated and has admin role
    const user = event.context.user || {};
    const roles = user.roles || [];

    if (
      !user.userID ||
      !(
        roles.includes("Admin") ||
        roles.includes("Superadmin") ||
        roles.includes("Developer")
      )
    ) {
      return {
        statusCode: 403,
        message: "Forbidden: You do not have permission to access action types",
      };
    }

    // Get unique action types from the audit table
    const actionTypes = await prisma.$queryRaw`
      SELECT DISTINCT auditAction
      FROM audit
      WHERE auditAction IS NOT NULL
      ORDER BY auditAction
    `;

    // Convert BigInt values if present
    // const processedActionTypes = convertBigIntToNumber(actionTypes);

    // Extract action names from the result
    const actions = actionTypes.map((item) => item.auditAction);

    return {
      statusCode: 200,
      data: actions,
    };
  } catch (error) {
    console.error("Error fetching action types:", error);
    return {
      statusCode: 500,
      message: "Internal server error: " + error.message,
    };
  }
});
