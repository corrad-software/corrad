export default defineEventHandler(async (event) => {
  // const query = await getQuery(event); || Get Params from URL
  // const body = await readBody(event);  || Get Body Data

  try {
    const customers = [
      {
        name: "Customer A",
        email: "customera@gmail.com",
        phoneno: "60123456789",
      },
      {
        name: "Customer B",
        email: "customerb@gmail.com",
        phoneno: "60123456789",
      },
      {
        name: "Customer C",
        email: "customerc@gmail.com",
        phoneno: "60123456789",
      },
    ]

    return {
      statusCode: 200,
      message: "New api created successfully",
      data: {
        totalCustomers: customers.length,
        list: customers,
      },
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: "Something went wrong",
    }
  }
})
