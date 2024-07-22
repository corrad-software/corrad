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

    // Get assistant Type

    const assistantTypes = await prisma.lookup.findMany({
      where: {
        lookupRefCode: "8",
      },
      select: {
        lookupID: true,
        lookupTitle: true,
      },
    });

    if (assistantTypes.length === 0) {
      return {
        statusCode: 400,
        message: "No assistant types found",
      };
    }

    const assistantList = await prisma.assistant.findMany({
      select: {
        assistantID: true,
        assistantName: true,
        assistantDescription: true,
        assistantImg: true,
        assistantType: true,
      },
    });

    // Group assistant by type
    let assistantGroup = [];

    assistantTypes.forEach((type) => {
      let assistantByType = assistantList.filter(
        (assistant) => assistant.assistantType === type.lookupID
      );

      assistantGroup.push({
        assistantType: type.lookupTitle,
        assistantList: assistantByType,
      });
    });

    return {
      statusCode: 200,
      message: "Success",
      data: assistantGroup,
    };
  } catch (error) {
    console.log("Error: ", error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
