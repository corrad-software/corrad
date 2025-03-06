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
        message: "Forbidden: You do not have permission to access audit logs",
      };
    }

    // Get query parameters
    const query = getQuery(event);
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const userId = query.userId ? parseInt(query.userId) : undefined;
    const action = query.action;
    
    // Handle date parameters with proper time settings
    let startDate = undefined;
    if (query.startDate) {
      startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0); // Set to beginning of day
    }
    
    let endDate = undefined;
    if (query.endDate) {
      endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
    }
    
    const ip = query.ip;

    // Build filter conditions
    const where = {};

    if (userId) {
      where.auditUserID = userId;
    }

    if (action) {
      where.auditAction = {
        contains: action,
      };
    }

    if (ip) {
      where.auditIP = {
        contains: ip,
      };
    }

    // Date range filter
    if (startDate || endDate) {
      where.auditCreatedDate = {};

      if (startDate) {
        where.auditCreatedDate.gte = startDate;
      }

      if (endDate) {
        where.auditCreatedDate.lte = endDate;
      }
    }

    // Get total count for pagination
    const total = await prisma.audit.count({ where });

    // Get audit logs with pagination
    const auditLogs = await prisma.audit.findMany({
      where,
      include: {
        user: {
          select: {
            userUsername: true,
            userFullName: true,
            userEmail: true,
          },
        },
      },
      orderBy: {
        auditCreatedDate: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Convert BigInt values to numbers
    // const processedLogs = convertBigIntToNumber(auditLogs);
    const processedTotal = Number(total);

    return {
      statusCode: 200,
      data: {
        logs: auditLogs,
        pagination: {
          page,
          limit,
          total: processedTotal,
          totalPages: Math.ceil(processedTotal / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return {
      statusCode: 500,
      message: "Internal server error: " + error.message,
    };
  }
});
