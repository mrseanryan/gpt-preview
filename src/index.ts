import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { exit } from "process";

import { buildSystemPrompt } from "./prompts.js";
import { getConfig } from "./util_config.js";
import { readJsonFromFile } from "./util_file.js";
import { printAssistant, printUser } from "./utils_print.js";

printAssistant("Hello from gpt-preview");
printUser("hi!");

const printUsage = (): void => {
  printAssistant("USAGE: <path to LLM output file> [OPTIONS]");
};

const args = process.argv.slice(2);
if (args.length !== 1) {
  printUsage();
  exit(2);
}

const pathToLlmOutputFile = args[0];
const llmOutput = JSON.stringify(readJsonFromFile(pathToLlmOutputFile));

const config = getConfig();

const client = new BedrockRuntimeClient({ region: config.awsRegion });

const messages = [
  {
    role: "assistant",
    content: "How can I help you?",
  },
  {
    role: "user",
    content: "Summarize the provided output to DOT format",
  },
];

const body = {
  max_tokens: 2048,
  system: buildSystemPrompt(llmOutput),
  messages: messages,
  temperature: config.temperature,
  top_p: config.top_p,
  anthropic_version: "bedrock-2023-05-31",
};

const params = {
  modelId: config.modelId,
  body: JSON.stringify(body),
  contentType: "application/json",
  accept: "*/*",
};
const command = new InvokeModelCommand(params);

// async/await.
try {
  const response = await client.send(command);
  // Save the raw response
  const rawRes = response.body;

  // Convert it to a JSON String
  const jsonString = new TextDecoder().decode(rawRes);

  // Parse the JSON string
  const parsedResponse = JSON.parse(jsonString);

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

  // process data.
  const responseText = parsedResponse.content[0].text;
  let dot = responseText.split("```dot")[1];
  dot = dot.split("```")[0];
  console.log("DOT", dot);
} catch (error) {
  // error handling.
  // const { requestId, cfId, extendedRequestId } = error?.$metadata;
  console.log({ error });
}
