import { AwsBedrockLlmClient } from "./llm_client_aws_bedrock.js";
import { Config, Platform } from "./util_config.js";

export const createLlmClient = (config: Config) => {
  switch (config.platform) {
    case Platform.AwsBedrock:
      return new AwsBedrockLlmClient(config);
    case Platform.OpenAI:
      throw new Error("Not implemented");
    default:
      throw new Error(
        `Not a recognised platform '${config.platform}' - please check your config file.`
      );
  }
};
