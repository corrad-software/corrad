export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized. Redirect to login.",
      };
    }

    const { threadID, projectID } = getQuery(event);

    if (!threadID || !projectID) {
      return {
        statusCode: 400,
        message:
          "Thread ID and Project ID are required. Redirect to dashboard.",
      };
    }
    const thread = await prisma.thread.findUnique({
      where: {
        threadOAIID: threadID,
        NOT: {
          lookup: {
            lookupID: 4,
          },
        },
      },
      select: {
        threadID: true,
        assistant: {
          select: {
            assistantOAIID: true,
            assistantName: true,
            assistantImg: true,
          },
        },
      },
    });

    if (!thread) {
      return {
        statusCode: 404,
        message: "Thread Not Found. Redirect to dashboard.",
      };
    }

    // Check if there is chating in the thread if just skip check permission
    const chat = await prisma.chat.findFirst({
      where: {
        threadID: thread.threadID,
      },
    });

    if (chat) {
      // Check if the user has permission to access this thread in the specified project
      const hasPermission = await checkThreadPermission(
        userID,
        thread.threadID,
        projectID
      );

      if (!hasPermission) {
        return {
          statusCode: 403,
          message:
            "You don't have permission to access this thread in the specified project. Redirect to dashboard.",
        };
      }
    }

    return {
      statusCode: 200,
      message: "Success",
      data: {
        assistantID: thread?.assistant?.assistantOAIID || null,
        assistantName: thread?.assistant?.assistantName || null,
        assistantImg: thread?.assistant?.assistantImg || null,
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      message: "Internal Server",
    };
  }
});

async function checkThreadPermission(userID, threadID, projectID) {
  // Check if the thread belongs to the specified project
  const threadInProject = await prisma.chat.findFirst({
    where: {
      threadID: threadID,
      project: {
        projectUniqueID: projectID,
      },
    },
  });

  if (!threadInProject) {
    return false;
  }

  const pj = await prisma.project.findUnique({
    where: {
      projectUniqueID: projectID,
    },
  });

  // Check if the user is the owner of the project
  const project = await prisma.project.findUnique({
    where: {
      projectUniqueID: projectID,
      userID: userID,
    },
  });

  if (project) {
    return true;
  }

  // Check if the user has direct permission to the project
  const directPermission = await prisma.project_permission.findFirst({
    where: {
      projectID: pj.projectID,
      userID: userID,
      projectPermissionStatus: "ACTIVE",
    },
  });

  if (directPermission) {
    return true;
  }

  // Check if the user has permission through role
  const userRoles = await prisma.userrole.findMany({
    where: {
      userRoleUserID: userID,
    },
    select: {
      userRoleRoleID: true,
    },
  });

  const roleIDs = userRoles.map((role) => role.userRoleRoleID);

  const rolePermission = await prisma.project_permission.findFirst({
    where: {
      projectID: pj.projectID,
      roleID: { in: roleIDs },
      projectPermissionStatus: "ACTIVE",
    },
  });

  return !!rolePermission;
}
