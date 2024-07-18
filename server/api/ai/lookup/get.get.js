export default defineEventHandler(async (event) => {
  try {
    let lookupType = "";

    const { code, type } = getQuery(event);

    if (!code) {
      return {
        statusCode: 400,
        message: "Required fields missing",
      };
    }

    // Get lookup ID
    const lookup = await prisma.lookup.findFirst({
      where: {
        lookupID: parseInt(code),
        lookupRefCode: "XXX",
      },
      select: {
        lookupID: true,
        lookupTitle: true,
      },
    });

    console.log(lookup);

    if (!lookup) {
      return {
        statusCode: 400,
        message: "No lookup found",
      };
    }

    // Get lookup list
    const lookupList = await prisma.lookup.findMany({
      select: {
        lookupID: true,
        lookupRefCode: true,
        lookupTitle: true,
        lookupValue: true,
      },
      where: {
        lookupRefCode: lookup.lookupID.toString(),
        lookupStatus: "ACTIVE",
      },
    });

    if (lookupList.length === 0) {
      return {
        statusCode: 400,
        message: "No lookup list found",
      };
    }

    let newLookupList = [];

    if (type === "SELECT") {
      // Add null value
      newLookupList.push({
        label: `Select ${lookup.lookupTitle}`,
        value: "",
      });

      // Remap lookup list
      lookupList.map((item) => {
        newLookupList.push({
          label: item.lookupTitle,
          value: item.lookupID,
        });
      });
    } else if (type === "RADIO") {
      // Remap lookup list
      lookupList.map((item) => {
        newLookupList.push({
          label: item.lookupTitle,
          value: item.lookupID,
        });
      });
    } else {
      newLookupList = lookupList;
    }

    return {
      statusCode: 200,
      message: "Lookup list successfully loaded",
      data: newLookupList,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      message: "Server error",
    };
  }
});
