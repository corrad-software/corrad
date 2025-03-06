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
        message: "Forbidden: You do not have permission to access user list",
      };
    }

    // Get all active users
    const users = await prisma.$queryRaw`
      SELECT DISTINCT 
        u.userID as id, 
        u.userUsername as username, 
        u.userFullName as fullName
      FROM user u
      WHERE u.userStatus = 'active'
      ORDER BY u.userFullName
    `;

    // Get users with audit activity (for potential filtering)
    const usersWithActivity = await prisma.$queryRaw`
      SELECT DISTINCT 
        u.userID as id
      FROM user u
      INNER JOIN audit a ON u.userID = a.auditUserID
    `;

    // Convert to a Set for quick lookups
    const activeUserIds = new Set(usersWithActivity.map(u => u.id));

    // Add a flag to indicate if the user has audit activity
    const enhancedUsers = users.map(user => ({
      ...user,
      hasActivity: activeUserIds.has(user.id)
    }));

    return {
      statusCode: 200,
      data: enhancedUsers,
    };
  } catch (error) {
    console.error("Error fetching user list:", error);
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  }
});
