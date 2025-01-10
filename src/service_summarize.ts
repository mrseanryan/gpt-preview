import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

import {
  buildSystemPromptToOutputDot,
  buildSystemPromptToOutputJson,
} from "./prompts.js";
import { Config } from "./util_config.js";
import { readJsonFromFile, writeTextToFile } from "./util_file.js";
import { printAssistant, printResult } from "./utils_print.js";

export enum OutputFormat {
  JSON = "JSON",
  DOT = "DOT",
}

export const summarizeFile = async (
  pathToLlmOutputFile: string,
  outputFormat: OutputFormat,
  config: Config,
  pathToOutputFile: string | null = ""
): Promise<string> => {
  printAssistant(
    `Summarizing file at '${pathToLlmOutputFile}' to ${outputFormat}`
  );
  const llmOriginalOutput = JSON.stringify(
    readJsonFromFile(pathToLlmOutputFile)
  );

  return summarizeText(
    llmOriginalOutput,
    outputFormat,
    config,
    pathToOutputFile
  );
};

const parseResponse = (
  response: string,
  outputFormat: OutputFormat,
  config: Config
): string => {
  let activeOutputFormat = outputFormat.toString();
  if (!response.includes(activeOutputFormat)) {
    activeOutputFormat = activeOutputFormat.toLowerCase();
  }
  if (!response.includes(activeOutputFormat)) {
    throw new Error(`Cannot parse the output to format ${outputFormat}`);
  }

  let parsedResponse = response.split("```" + activeOutputFormat)[1];
  parsedResponse = parsedResponse.split("```")[0];

  if (config.isDebug) {
    console.log(parsedResponse);
  }

  return parsedResponse;
};

export const summarizeText = async (
  llmOriginalOutput: string,
  outputFormat: OutputFormat,
  config: Config,
  pathToOutputFile: string | null = ""
): Promise<string> => {
  printAssistant("Connecting...");
  const client = new BedrockRuntimeClient({ region: config.awsRegion });

  const messages = [
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

  const body = {
    max_tokens: 2048,
    system: buildSystemPrompt(llmOriginalOutput),
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

  try {
    printAssistant("Summarizing...");

    const response = await client.send(command);
    // Save the raw response
    const rawRes = response.body;

    // Convert it to a JSON String
    const jsonString = new TextDecoder().decode(rawRes);

    // Parse the JSON string
    const parsedResponse = JSON.parse(jsonString);

    if (config.isDebug) {
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

    // process data.
    printAssistant("Outputting result...");
    const responseText: string = parsedResponse.content[0].text;

    const resultParsed = parseResponse(responseText, outputFormat, config);

    if (pathToOutputFile && pathToOutputFile.length) {
      printAssistant(`Writing result to ${pathToOutputFile}`);
      writeTextToFile(pathToOutputFile, resultParsed);
    } else {
      printResult(resultParsed);
    }

    printAssistant("[done]");

    return resultParsed;
  } catch (error) {
    // TODO improve error handling - const { requestId, cfId, extendedRequestId } = error?.$metadata;
    console.log({ error });
  }

  return "";
};
