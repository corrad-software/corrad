async function getLookupList(code) {
  try {
    // const getLookup = await prisma.lookup.findFirst({
    //   where: {
    //     lookupRefCode: code,
    //   },
    //   select: {
    //     lookupID: true,
    //   },
    // });
    // console.log("getLookup", getLookup);

    // if (!getLookup) return false;

    // Get Child for that lookup
    const lookupData = await prisma.lookup.findMany({
      where: {
        lookupRefCode: code,
        lookupStatus: "ACTIVE",
      },
      select: {
        lookupID: true,
        lookupTitle: true,
        lookupValue: true,
      },
    });

    if (!lookupData || lookupData.length === 0) return false;

    const renamedLookupData = lookupData.map((ld) => {
      return {
        id: ld.lookupID,
        name: ld.lookupTitle,
        value: ld.lookupValue,
      };
    });

    return renamedLookupData;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getLookup(id, refCode) {
  try {
    const getLookup = await prisma.lookup.findFirst({
      where: {
        lookupID: parseInt(id),
        lookupRefCode: refCode,
        lookupStatus: "ACTIVE",
      },
      select: {
        lookupTitle: true,
        lookupValue: true,
      },
    });

    if (!getLookup) {
      return null;
    }

    return {
      name: getLookup.lookupTitle,
      value: getLookup.lookupValue,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getLookupByTitle(title) {
  try {
    const getLookup = await prisma.lookup.findFirst({
      where: {
        lookupTitle: title,
      },
      select: {
        lookupID: true,
      },
    });

    if (!getLookup) {
      return null;
    }

    return getLookup.lookupID;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export { getLookupList, getLookup, getLookupByTitle };
