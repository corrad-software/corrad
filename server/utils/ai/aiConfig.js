export async function getConfiguration(configurationCode) {
  return await prisma.configuration.findFirst({
    where: {
      configurationCode: configurationCode,
      configurationValue: {
        not: null,
      },
    },
    select: {
      configurationValue: true,
    },
  });
}

export async function loadProviderConfig(provider) {
  const configs = {
    openai: {
      required: ["OPENAI_API_KEY", "OPENAI_PROJECT_ID", "ASSISTANT_MODEL"],
      errorMessages: {
        OPENAI_API_KEY: "Please set OpenAI API Key in settings.",
        OPENAI_PROJECT_ID: "Please set OpenAI Project ID in settings.",
        ASSISTANT_MODEL: "Please set OpenAI Assistant Model in settings.",
      },
    },
    claude: {
      required: ["CLAUDE_API_KEY", "CLAUDE_MODEL"],
      errorMessages: {
        CLAUDE_API_KEY: "Please set Claude API Key in settings.",
        CLAUDE_MODEL: "Please set Claude Model in settings.",
      },
    },
  };

  const providerConfig = configs[provider];
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const config = {};
  for (const key of providerConfig.required) {
    const value = await getConfiguration(key);
    if (!value) {
      throw new Error(providerConfig.errorMessages[key]);
    }
    config[key] = value.configurationValue;
  }

  return config;
}
