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

    // Get user's roles
    const userRoles = await prisma.userrole.findMany({
      where: {
        userRoleUserID: userID,
      },
      select: {
        userRoleRoleID: true,
      },
    });

    const roleIDs = userRoles.map((role) => role.userRoleRoleID);

    // First, get only the projects owned by the user
    const userOwnedProjects = await prisma.project.findMany({
      where: {
        userID: userID,
      },
      select: {
        projectUniqueID: true,
        projectName: true,
        projectDefault: true,
      },
    });

    // Create new project if the user doesn't own any projects
    if (userOwnedProjects.length === 0) {
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

      userOwnedProjects.push(newProject);
    }

    // Then, get all projects including shared ones
    const allProjects = await prisma.project.findMany({
      where: {
        OR: [
          { userID: userID },
          {
            project_permission_project_permission_projectIDToproject: {
              some: {
                OR: [{ userID: userID }, { roleID: { in: roleIDs } }],
                projectPermissionStatus: "ACTIVE",
              },
            },
          },
        ],
      },
      select: {
        projectUniqueID: true,
        projectName: true,
        projectDefault: true,
        userID: true,
        projectPublic: true,
        project_permission_project_permission_projectIDToproject: {
          select: {
            userID: true,
            roleID: true,
          },
        },
      },
      distinct: ["projectUniqueID"],
    });

    // Remap to options
    const projectOptions = allProjects.map((project) => {
      const isOwner = project.userID === userID;
      const isShared =
        !isOwner &&
        (project.projectPublic ||
          project.project_permission_project_permission_projectIDToproject
            .length > 0);

      return {
        value: project.projectUniqueID,
        label: `${project.projectName}${isShared ? " (Shared)" : ""}`,
        isOwner,
        isShared,
      };
    });

    const defaultProject = userOwnedProjects.find(
      (project) => project.projectDefault
    );

    return {
      statusCode: 200,
      message: "Success get project list",
      data: {
        projectOptions,
        defaultProject: defaultProject ? defaultProject.projectUniqueID : null,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      message: "Something went wrong",
    };
  }
});
