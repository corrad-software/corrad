import { AIFactory } from "./ai/aiFactory";

const main = async (providerName = "openai") => {
  return await AIFactory.createProvider(providerName);
};

export default main;
