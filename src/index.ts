import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { exit } from "process";

import {
  buildSystemPromptToOutputDot,
  buildSystemPromptToOutputJson,
} from "./prompts.js";
import { getConfig } from "./util_config.js";
import { readJsonFromFile, writeTextToFile } from "./util_file.js";
import { printAssistant, printUser } from "./utils_print.js";

printAssistant("Hello from gpt-preview");
printUser("hi!");

const printUsage = (): void => {
  printAssistant(
    "USAGE: <path to LLM output file> [OPTIONS]\n",
    "  where OPTIONS are:\n",
    "  -f=<DOT|JSON> (default is DOT)\n",
    "  -o=<path to output file>\n"
  );
};

let pathToLlmOutputFile = "";
let pathToOutputFile = "";

enum OutputFormat {
  JSON = "JSON",
  DOT = "DOT",
}

let outputFormat: OutputFormat;
outputFormat = OutputFormat.DOT;

const partition = (arr: any[], fn: Function) =>
  arr.reduce(
    (acc, val, i, arr) => {
      acc[fn(val, i, arr) ? 0 : 1].push(val);
      return acc;
    },
    [[], []]
  );

const argsRaw = process.argv.slice(2);

const argsOrOptions = partition(argsRaw, (a) => a.startsWith("-"));
const options = argsOrOptions[0];
const args = argsOrOptions[1];
if (args.length === 1) {
  pathToLlmOutputFile = args[0];
} else {
  printUsage();
  exit(2);
}

options.forEach((o: string) => {
  const parts = o.split("=");
  const option = parts[0];
  switch (option) {
    case "-f":
      switch (parts[1]) {
        case "DOT":
          outputFormat = OutputFormat.DOT;
          break;
        case "JSON":
          outputFormat = OutputFormat.JSON;
          break;
        default:
          console.error(`Not a recognised format ${parts[1]}`);
      }
      break;
    case "-o":
      pathToOutputFile = parts[1];
      break;
    default:
      console.error(`Not a recognised option ${o}`);
      printUsage();
      exit(3);
  }
});

const config = getConfig();

printAssistant(
  `Summarizing file at '${pathToLlmOutputFile}' to ${outputFormat}`
);
const llmOriginalOutput = JSON.stringify(readJsonFromFile(pathToLlmOutputFile));

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
switch (outputFormat) {
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

// async/await.
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
  const responseText = parsedResponse.content[0].text;
  let dot = responseText.split("```" + outputFormat)[1];
  dot = dot.split("```")[0];
  console.log(dot);

  if (pathToOutputFile.length) {
    printAssistant(`Writing result to ${pathToOutputFile}`);
    writeTextToFile(pathToOutputFile, dot);
  }

  printAssistant("[done]");
} catch (error) {
  // error handling.
  // const { requestId, cfId, extendedRequestId } = error?.$metadata;
  console.log({ error });
}
