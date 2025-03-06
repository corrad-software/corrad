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

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Custom JSON stringify function to handle BigInt
function safeStringify(obj) {
  return JSON.stringify(obj, (_, value) => 
    typeof value === 'bigint' ? Number(value) : value
  );
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
        message:
          "Forbidden: You do not have permission to access audit statistics",
      };
    }

    // Get query parameters for time range
    const query = getQuery(event);
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    
    // Set start date to beginning of day (00:00:00.000)
    startDate.setHours(0, 0, 0, 0);
    
    // For end date, get the date and set time to end of day (23:59:59.999)
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);

    // Date range filter
    const dateFilter = {
      auditCreatedDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Get total activity count
    const totalActivities = await prisma.audit.count({
      where: dateFilter,
    });

    // Get login count
    const loginCount = await prisma.audit.count({
      where: {
        ...dateFilter,
        auditAction: "User Login",
      },
    });

    // Get logout count
    const logoutCount = await prisma.audit.count({
      where: {
        ...dateFilter,
        auditAction: "User Logout",
      },
    });

    // Get data operation counts
    const createCount = await prisma.audit.count({
      where: {
        ...dateFilter,
        auditAction: "Data Created",
      },
    });

    const updateCount = await prisma.audit.count({
      where: {
        ...dateFilter,
        auditAction: "Data Updated",
      },
    });

    const deleteCount = await prisma.audit.count({
      where: {
        ...dateFilter,
        auditAction: "Data Deleted",
      },
    });

    const viewCount = await prisma.audit.count({
      where: {
        ...dateFilter,
        auditAction: "Data Viewed",
      },
    });

    // Get most active users
    const activeUsers = await prisma.$queryRaw`
      SELECT 
        a.auditUserID, 
        u.userUsername, 
        u.userFullName, 
        COUNT(*) as activityCount 
      FROM audit a
      LEFT JOIN user u ON a.auditUserID = u.userID
      WHERE a.auditCreatedDate >= ${startDate} AND a.auditCreatedDate <= ${endDate}
      GROUP BY a.auditUserID, u.userUsername, u.userFullName
      ORDER BY activityCount DESC
      LIMIT 10
    `;

    // Get most common IP addresses
    const commonIPs = await prisma.$queryRaw`
      SELECT 
        auditIP, 
        COUNT(*) as count 
      FROM audit
      WHERE auditCreatedDate >= ${startDate} AND auditCreatedDate <= ${endDate}
      GROUP BY auditIP
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get activity by day with action breakdowns (for charts)
    const activityByDay = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(auditCreatedDate, '%Y-%m-%d') as date, 
        COUNT(*) as count 
      FROM audit
      WHERE auditCreatedDate >= ${startDate} AND auditCreatedDate <= ${endDate}
      GROUP BY DATE_FORMAT(auditCreatedDate, '%Y-%m-%d')
      ORDER BY date
    `;

    // Get action breakdowns by day
    const actionsByDay = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(auditCreatedDate, '%Y-%m-%d') as date,
        auditAction as action,
        COUNT(*) as count
      FROM audit
      WHERE 
        auditCreatedDate >= ${startDate} 
        AND auditCreatedDate <= ${endDate}
      GROUP BY DATE_FORMAT(auditCreatedDate, '%Y-%m-%d'), auditAction
      ORDER BY date, auditAction
    `;

    // Convert raw data to handle BigInt values
    const convertedActivityByDay = convertBigIntToNumber(activityByDay);
    const convertedActionsByDay = convertBigIntToNumber(actionsByDay);

    // Process the activity data to include action breakdowns
    const processedActivityByDay = convertedActivityByDay.map(day => {
      // Find all actions for this day
      const dayActions = convertedActionsByDay.filter(
        action => action.date === day.date
      );
      
      // Return enhanced day object with actions array
      return {
        ...day,
        actions: dayActions.map(action => ({
          action: action.action,
          count: action.count
        }))
      };
    });

    try {
      console.log("Raw activity data:", safeStringify(convertedActivityByDay));
      console.log("Processed activity data:", safeStringify(processedActivityByDay));
    } catch (logError) {
      console.error("Error logging activity data:", logError);
    }

    // If there's no data for the selected period, create a date range with zero counts
    if (processedActivityByDay.length === 0) {
      console.log("No activity data found, generating date range");
      const dateRange = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dateRange.push({
          date: formatDate(currentDate),
          count: 0,
          actions: []
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Use the generated date range if no actual data exists
      if (dateRange.length > 0) {
        processedActivityByDay.push(...dateRange);
      }
    }

    // Convert BigInt values to numbers before returning
    const responseData = {
      totalActivities: Number(totalActivities),
      loginCount: Number(loginCount),
      logoutCount: Number(logoutCount),
      createCount: Number(createCount),
      updateCount: Number(updateCount),
      deleteCount: Number(deleteCount),
      viewCount: Number(viewCount),
      activeUsers: convertBigIntToNumber(activeUsers),
      commonIPs: convertBigIntToNumber(commonIPs),
      activityByDay: processedActivityByDay,
      timeRange: {
        startDate,
        endDate,
      },
    };

    return {
      statusCode: 200,
      data: responseData,
    };
  } catch (error) {
    console.error("Error fetching audit statistics:", error);
    return {
      statusCode: 500,
      message: "Internal server error: " + error.message,
    };
  }
});
