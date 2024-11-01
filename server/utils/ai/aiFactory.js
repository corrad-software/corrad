import { OpenAIProvider } from "./providers/openAI";
import { ClaudeProvider } from "./providers/claude";
import { loadProviderConfig } from "./aiConfig";

export class AIFactory {
  static async createProvider(providerName) {
    try {
      const config = await loadProviderConfig(providerName);

      const providers = {
        openai: () =>
          new OpenAIProvider({
            apiKey: config.OPENAI_API_KEY,
            projectId: config.OPENAI_PROJECT_ID,
            model: config.ASSISTANT_MODEL,
          }),
        claude: () =>
          new ClaudeProvider({
            apiKey: config.CLAUDE_API_KEY,
            model: config.CLAUDE_MODEL,
          }),
      };

      const provider = providers[providerName]?.();
      if (!provider) {
        throw new Error(`Unsupported AI provider: ${providerName}`);
      }

      const isValid = await provider.validate();
      if (!isValid) {
        throw new Error(`Failed to validate ${providerName} configuration`);
      }

      return {
        statusCode: 200,
        message: "Success",
        data: {
          provider: provider,
          config: config,
        },
      };
    } catch (error) {
      console.error(`Error creating ${providerName} provider:`, error);
      return {
        statusCode: 400,
        message: error.message,
      };
    }
  }
}
