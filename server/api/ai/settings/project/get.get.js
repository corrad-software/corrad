export default defineEventHandler(async (event) => {
  try {
    const { projectID } = getQuery(event);
    const { userID } = event.context.user;

    if (!projectID) {
      return {
        statusCode: 400,
        message: "Project ID is required",
      };
    }

    const getProject = await prisma.project.findUnique({
      where: { projectUniqueID: projectID },
      include: {
        project_permission_project_permission_projectIDToproject: {
          where: { projectPermissionStatus: "ACTIVE" },
          include: { role: true, user: true },
        },
        lookup_project_projectViewTypeTolookup: true,
      },
    });

    if (!getProject) {
      return {
        statusCode: 404,
        message: "Project not found",
      };
    }

    const [selectedUsers, selectedRoles] = await Promise.all([
      prisma.user.findMany({
        where: { userID },
        select: { userID: true, userUsername: true },
      }),
      prisma.role.findMany({
        select: { roleID: true, roleName: true },
      }),
    ]);

    const userOptions = selectedUsers.map(({ userID, userUsername }) => ({
      value: userID,
      label: userUsername,
    }));

    const roleOptions = selectedRoles.map(({ roleID, roleName }) => ({
      value: roleID,
      label: roleName,
    }));

    const projectViewType =
      getProject?.lookup_project_projectViewTypeTolookup?.lookupValue;
    const projectUserRoles = projectViewType
      ? getProject.project_permission_project_permission_projectIDToproject.map(
          (permission) => ({
            label:
              projectViewType === "user"
                ? permission.user.userUsername
                : permission.role.roleName,
            value:
              projectViewType === "user"
                ? permission.userID
                : permission.roleID,
          })
        )
      : [];

    return {
      statusCode: 200,
      message: "Success get project",
      data: {
        project: {
          projectID: getProject.projectID,
          projectName: getProject.projectName,
          projectDescription: getProject.projectDescription,
          projectPublic: getProject.projectPublic,
          projectDefault: getProject.projectDefault,
          projectViewType,
          projectUserRoles,
        },
        users: userOptions,
        roles: roleOptions,
      },
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
