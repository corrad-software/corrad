import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;
    const { projectName, projectDescription } = await readBody(event);

    if (userID == null) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    // Check if project name same with existing project
    const existingProject = await prisma.project.findFirst({
      where: {
        projectName: projectName,
        userID: userID,
      },
    });

    if (existingProject) {
      return {
        statusCode: 400,
        message: "Project name already exists",
      };
    }

    const newProject = await prisma.project.create({
      data: {
        projectUniqueID: uuidv4(),
        projectName: projectName,
        projectDescription: projectDescription,
        projectDefault: false,
        projectType: 6, // 6 is for PRIVATE from Lookup Table
        projectPublic: false,
        userID: userID,
        projectCreatedDate: DateTime.now().toISO(),
      },
    });

    return {
      statusCode: 200,
      message: "Success create new project",
      data: {
        projectID: newProject.projectUniqueID,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
