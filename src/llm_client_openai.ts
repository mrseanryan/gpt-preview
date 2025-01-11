import OpenAI from "openai";

import { Config, Platform } from "./util_config.js";
import { ILlmClient, LlmMessage } from "./llm_client_base.js";
import { ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

export class OpenAiLlmClient implements ILlmClient {
  private readonly config: Config;
  private client: OpenAI | undefined;

  constructor(config: Config) {
    this.config = config;
  }

  connect(): void {
    this.client = new OpenAI();
  }

  public getPlatform = (): Platform => Platform.OpenAI;

  public async send(
    systemPrompt: string,
    messages: LlmMessage[]
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Not connected - please first call connect()");
    }
    const activeMessages: (
      | ChatCompletionSystemMessageParam
      | ChatCompletionMessageParam
    )[] = [
      {
        content: systemPrompt,
        role: "system",
      },
      ...messages,
    ];

    const completion = await this.client.chat.completions.create({
      model: this.config.modelId,
      messages: activeMessages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      // TODO try response_format
    });

    return completion.choices[0].message.content ?? "";
  }
}
