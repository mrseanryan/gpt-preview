import { Platform } from "./util_config.js";

export interface ILlmClient {
  connect(): void;
  getPlatform(): Platform;
  send(systemPrompt: string, messages: LlmMessage[]): Promise<string>;
}

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}
