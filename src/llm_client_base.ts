export interface ILlmClient {
  connect(): void;
  send(systemPrompt: string, messages: [LlmMessage]): Promise<string>;
}

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}
