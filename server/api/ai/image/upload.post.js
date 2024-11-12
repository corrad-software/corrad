import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { image, filename } = body;

    // Validate input
    if (!image || !filename) {
      return {
        statusCode: 400,
        message: "Image and filename are required",
      };
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      process.env.SERVER === "false"
        ? "/public/uploads/image"
        : "../public/uploads/image"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename to prevent overwrites
    const uniqueFilename = `${Date.now()}-${filename}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Convert base64 to buffer and save
    const buffer = Buffer.from(image, "base64");
    fs.writeFileSync(filePath, buffer);

    // Return success response with file details
    return {
      statusCode: 200,
      message: "Image uploaded successfully",
      filename: uniqueFilename,
      path: `/uploads/image/${uniqueFilename}`, // relative path for frontend use
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      statusCode: 500,
      message: "Failed to upload image",
      error: error.message,
    };
  }
});
