import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Normalize paths
  const oldPath = body.filePath.endsWith("/")
    ? body.filePath
    : body.filePath + "/";
  const newPath = body.formData.path.endsWith("/")
    ? body.formData.path
    : body.formData.path + "/";

  // Get file paths
  const oldFilePath = path.join(process.cwd(), "pages", oldPath, "index.vue");
  const newFilePath = path.join(process.cwd(), "pages", newPath, "index.vue");

  try {
    if (oldPath !== newPath) {
      // Create the new folder if it doesn't exist
      fs.mkdirSync(path.dirname(newFilePath), { recursive: true });

      // Read the content of the old file
      let content = fs.readFileSync(oldFilePath, "utf8");

      // Update the metadata in the content
      content = content.replace(
        /definePageMeta\({[\s\S]*?}\);/,
        `definePageMeta({
  title: "${body.formData.title || body.formData.name}",
});`
      );

      // Write the updated content to the new file
      fs.writeFileSync(newFilePath, content);

      // Delete the old file
      fs.unlinkSync(oldFilePath);

      // Remove empty directories
      let dirToCheck = path.dirname(oldFilePath);
      while (dirToCheck !== path.join(process.cwd(), "pages")) {
        if (fs.readdirSync(dirToCheck).length === 0) {
          fs.rmdirSync(dirToCheck);
          dirToCheck = path.dirname(dirToCheck);
        } else {
          break;
        }
      }

      return {
        statusCode: 200,
        message:
          "Menu successfully copied to new location with updated metadata, and old menu deleted",
      };
    } else {
      // If paths are the same, just update the existing file's metadata
      let content = fs.readFileSync(oldFilePath, "utf8");

      content = content.replace(
        /definePageMeta\({[\s\S]*?}\);/,
        `definePageMeta({
  title: "${body.formData.title || body.formData.name}",
});`
      );

      fs.writeFileSync(oldFilePath, content);

      return {
        statusCode: 200,
        message: "Menu metadata successfully updated at the same location",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: error.message,
    };
  }
});
