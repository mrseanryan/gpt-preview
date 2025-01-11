import { AwsBedrockLlmClient } from "./llm_client_aws_bedrock.js";
import { ILlmClient } from "./llm_client_base.js";
import { OpenAiLlmClient } from "./llm_client_openai.js";
import { Config, Platform } from "./util_config.js";

export const createLlmClient = (config: Config): ILlmClient => {
  switch (config.platform) {
    case Platform.AwsBedrock:
      return new AwsBedrockLlmClient(config);
    case Platform.OpenAI:
      return new OpenAiLlmClient(config);
    default:
      throw new Error(
        `Not a recognised platform '${config.platform}' - please check your config file.`
      );
  }
};
