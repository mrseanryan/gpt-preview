import {
  buildSystemPromptToOutputDot,
  buildSystemPromptToOutputJson,
} from "./prompts.js";
import { Config, Platform } from "./util_config.js";
import { readTextFromFile, writeTextToFile } from "./util_file.js";
import { printAssistant, printResult } from "./utils_print.js";
import { createLlmClient } from "./llm_client_factory.js";
import { LlmMessage } from "./llm_client_base.js";

export enum OutputFormat {
  JSON = "JSON",
  DOT = "DOT",
}

export { Platform };

export const summarizeFile = async (
  pathToLlmOutputFile: string,
  outputFormat: OutputFormat,
  config: Config,
  pathToOutputFile: string | null = ""
): Promise<string> => {
  printAssistant(
    `Summarizing file at '${pathToLlmOutputFile}' to ${outputFormat}`
  );
  const llmOriginalOutput = readTextFromFile(pathToLlmOutputFile);

  const summary = await summarizeText(llmOriginalOutput, outputFormat, config);

  if (pathToOutputFile && pathToOutputFile.length) {
    printAssistant(`Writing result to ${pathToOutputFile}`);
    writeTextToFile(pathToOutputFile, summary);
  }

  return summary;
};

const parseResponse = (
  response: string,
  outputFormat: OutputFormat,
  config: Config
): string => {
  let activeOutputFormat = outputFormat.toString();
  let START_TOKEN = "```" + activeOutputFormat;
  if (!response.includes(START_TOKEN)) {
    activeOutputFormat = activeOutputFormat.toLowerCase();
    START_TOKEN = "```" + activeOutputFormat;
  }
  if (!response.includes(activeOutputFormat)) {
    throw new Error(`Cannot parse the output to format ${outputFormat}`);
  }

  let parsedResponse = response.split(START_TOKEN)[1];
  parsedResponse = parsedResponse.split("```")[0];

  if (config.isDebug) {
    console.log(parsedResponse);
  }

  return parsedResponse;
};

export const summarizeText = async (
  llmOriginalOutput: string,
  outputFormat: OutputFormat,
  config: Config
): Promise<string> => {
  const messages: LlmMessage[] = [
    {
      role: "assistant",
      content: "How can I help you?",
    },
    {
      role: "user",
      content: `Summarize the provided output to ${outputFormat} format`,
    },
  ];

  let buildSystemPrompt: Function = buildSystemPromptToOutputDot;
  switch (outputFormat as OutputFormat) {
    case OutputFormat.DOT:
      buildSystemPrompt = buildSystemPromptToOutputDot;
      break;
    case OutputFormat.JSON:
      buildSystemPrompt = buildSystemPromptToOutputJson;
      break;
    default:
      throw new Error(`Not a recognised format ${outputFormat}`);
  }

  const systemPrompt = buildSystemPrompt(llmOriginalOutput);

  try {
    const client = createLlmClient(config);

    printAssistant(`Connecting to [${client.getPlatform()}]...`);
    client.connect();

    printAssistant("Summarizing...");
    const responseText = await client.send(systemPrompt, messages);

    printAssistant("Outputting result...");
    const resultParsed = parseResponse(responseText, outputFormat, config);
    printResult(resultParsed);

    printAssistant("[done]");

    return resultParsed;
  } catch (error) {
    // TODO improve error handling - AWS: const { requestId, cfId, extendedRequestId } = error?.$metadata;
    console.log({ error });
  }

  return "";
};
