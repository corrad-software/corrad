/**
 * API endpoint to expose application metrics for monitoring
 */
import { getMetrics } from "../../utils/metrics";

export default defineEventHandler(async (event) => {
  try {
    // Get application metrics
    const appMetrics = getMetrics();
    
    // Get database metrics
    const userCount = await prisma.user.count();
    const activeUserCount = await prisma.user.count({
      where: {
        userStatus: 'active',
      },
    });
    const auditCount = await prisma.audit.count();
    
    // Get the latest audit entries for context
    const latestAudits = await prisma.audit.findMany({
      take: 5,
      orderBy: {
        auditCreatedAt: 'desc',
      },
      select: {
        auditAction: true,
        auditUsername: true,
        auditCreatedAt: true,
      },
    });
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    const systemMetrics = {
      // Database stats
      database: {
        userCount,
        activeUserCount,
        auditCount,
        latestAudits,
      },
      
      // Application stats from shared metrics
      requests: {
        total: appMetrics.requestCount,
        errors: appMetrics.errorCount,
      },
      
      // User activity
      users: {
        logins: appMetrics.loginCount,
        logouts: appMetrics.logoutCount,
        failedLogins: appMetrics.failedLoginCount,
        activeSessions: appMetrics.activeSessionCount,
      },
      
      // Geographical data
      geography: {
        countryActivity: appMetrics.countryActivity,
      },
      
      // System stats
      system: {
        uptime: appMetrics.uptime,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // in MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // in MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // in MB
        },
      },
      
      // Timestamp
      timestamp: new Date().toISOString(),
    };
    
    return systemMetrics;
  } catch (error) {
    console.error('Error getting metrics:', error);
    return {
      error: 'Failed to retrieve metrics',
      message: error.message,
    };
  }
}); 