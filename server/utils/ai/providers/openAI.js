import OpenAI from "openai";

export class OpenAIProvider {
  constructor(config) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      project: config.projectId,
    });
  }

  async validate() {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error("OpenAI validation error:", error);
      return false;
    }
  }

  getClient() {
    return this.client;
  }
}
