import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    let projectList = await prisma.project.findMany({
      where: {
        userID: userID,
      },
      select: {
        projectUniqueID: true,
        projectName: true,
        projectDefault: true,
      },
    });

    // Create new project if no project exists
    if (projectList.length === 0) {
      const newProject = await prisma.project.create({
        data: {
          projectUniqueID: uuidv4(),
          projectName: "Default Project",
          projectDefault: true,
          projectType: 6, // 6 is for PRIVATE from Lookup Table
          userID: userID,
          projectCreatedDate: DateTime.now().toISO(),
        },
        select: {
          projectUniqueID: true,
          projectName: true,
          projectDefault: true,
        },
      });

      projectList.push(newProject);
    }

    // Remap to options
    const project = projectList.map((project) => {
      return {
        value: project.projectUniqueID,
        label: project.projectName,
      };
    });

    return {
      statusCode: 200,
      message: "Success get project list",
      data: {
        projectOptions: project,
        defaultProject: projectList.find((project) => project.projectDefault)
          .projectUniqueID,
      },
    };
  } catch (error) {
    console.log(error);

    return {
      statusCode: 401,
      message: "Something went wrong",
    };
  }
});

async function hasPermission(userID, projectID) {
  const userPermissions = await prisma.project_permission.findMany({
    where: {
      userID: userID,
      projectPermissionID: projectID,
    },
  });

  if (userPermissions.length > 0) return true;

  const userRoles = await prisma.userrole.findMany({
    where: {
      userRoleUserID: userID,
    },
  });

  const roleIDs = userRoles.map((role) => role.userRoleRoleID);

  const rolePermissions = await prisma.project_permission.findMany({
    where: {
      roleID: { in: roleIDs },
      projectID: projectID,
    },
  });

  return rolePermissions.length > 0;
}
