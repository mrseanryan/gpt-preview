import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { Config, Platform } from "./util_config.js";
import { ILlmClient, LlmMessage } from "./llm_client_base.js";

export class AwsBedrockLlmClient implements ILlmClient {
  private readonly config: Config;
  private client: BedrockRuntimeClient | undefined;

  constructor(config: Config) {
    this.config = config;
  }

  public connect(): void {
    this.client = new BedrockRuntimeClient({ region: this.config.awsRegion });
  }

  public getPlatform = (): Platform => Platform.AwsBedrock;

  public async send(
    systemPrompt: string,
    messages: LlmMessage[]
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Not connected - please first call connect()");
    }

    const body = {
      max_tokens: this.config.maxTokens,
      system: systemPrompt,
      messages: messages,
      temperature: this.config.temperature,
      top_p: this.config.top_p,
      anthropic_version: "bedrock-2023-05-31",
    };

    const params = {
      modelId: this.config.modelId,
      body: JSON.stringify(body),
      contentType: "application/json",
      accept: "*/*",
    };
    const command = new InvokeModelCommand(params);

    const response = await this.client.send(command);
    const rawRes = response.body;

    // Convert it to a JSON String
    const jsonString = new TextDecoder().decode(rawRes);

    // Parse the JSON string
    const parsedResponse = JSON.parse(jsonString);

    if (this.config.isDebug) {
      console.log("-------------------------");
      console.log("---Pased Response Body---");
      console.log("-------------------------");
      console.log(parsedResponse);
      console.log("-------------------------");
      console.log("-------------------------");
      console.log("----Completion Result----");
      console.log("-------------------------");
      console.log(parsedResponse.generation);
      console.log("-------------------------");
    }

    const responseText: string = parsedResponse.content[0].text;
    return responseText;
  }
}
