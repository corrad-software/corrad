import Anthropic from "@anthropic-ai/sdk";

export class ClaudeProvider {
  constructor(config) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async validate() {
    try {
      // Add Claude-specific validation here
      return true;
    } catch (error) {
      console.error("Claude validation error:", error);
      return false;
    }
  }

  getClient() {
    return this.client;
  }
}
