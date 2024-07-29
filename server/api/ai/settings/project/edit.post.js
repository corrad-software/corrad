import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    const {
      projectID,
      projectName,
      projectDescription,
      projectPublic,
      viewType,
      userRoles,
      projectDefault,
    } = await readBody(event);

    if (!projectID) {
      return {
        statusCode: 400,
        message: "Project ID is required",
      };
    }

    const getLookup = await prisma.lookup.findFirst({
      where: {
        lookupRefCode: "12",
        lookupValue: viewType,
      },
    });

    if (!getLookup) {
      return {
        statusCode: 400,
        message: "Invalid view type",
      };
    }

    // If setting this project as default, unset any existing default project
    if (projectDefault) {
      await prisma.project.updateMany({
        where: {
          userID: userID,
          projectDefault: true,
        },
        data: {
          projectDefault: false,
        },
      });
    }

    // Update project details
    const updatedProject = await prisma.project.update({
      where: {
        projectUniqueID: projectID,
      },
      data: {
        projectName,
        projectDescription,
        projectPublic,
        projectDefault,
        projectModifiedDate: DateTime.now().toJSDate(),
        lookup_project_projectViewTypeTolookup: {
          connect: {
            lookupID: getLookup.lookupID,
          },
        },
      },
    });

    // Get existing permissions
    const existingPermissions = await prisma.project_permission.findMany({
      where: {
        projectID: updatedProject.projectID,
      },
    });

    // Update or create permissions
    for (const role of userRoles) {
      const existingPermission = existingPermissions.find(
        (p) => p[viewType === "user" ? "userID" : "roleID"] === role.value
      );

      if (existingPermission) {
        // Update existing permission
        await prisma.project_permission.update({
          where: {
            projectPermissionID: existingPermission.projectPermissionID,
          },
          data: {
            projectPermissionStatus: "ACTIVE",
            projectPermissionModifiedDate: DateTime.now().toJSDate(),
          },
        });
      } else {
        // Create new permission
        await prisma.project_permission.create({
          data: {
            projectID: updatedProject.projectID,
            [viewType === "user" ? "userID" : "roleID"]: role.value,
            projectPermissionStatus: "ACTIVE",
            projectPermissionCreatedDate: DateTime.now().toJSDate(),
          },
        });
      }
    }

    // Deactivate permissions that are no longer in userRoles
    const permissionsToDeactivate = existingPermissions.filter(
      (p) =>
        !userRoles.some(
          (r) => r.value === p[viewType === "user" ? "userID" : "roleID"]
        )
    );

    for (const permission of permissionsToDeactivate) {
      await prisma.project_permission.update({
        where: { projectPermissionID: permission.projectPermissionID },
        data: {
          projectPermissionStatus: "INACTIVE",
          projectPermissionModifiedDate: DateTime.now().toJSDate(),
        },
      });
    }

    return {
      statusCode: 200,
      message: "Project updated successfully",
    };
  } catch (error) {
    console.error("Error updating project:", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
