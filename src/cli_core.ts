import { exit } from "process";

import { printAssistant, printUser } from "./utils_print.js";
import { OutputFormat, summarizeFile } from "./service_summarize.js";
import { getConfig } from "./util_config.js";

export const main = (): void => {
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

  const argsOrOptions = partition(argsRaw, (a: string) => a.startsWith("-"));
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

  summarizeFile(
    pathToLlmOutputFile,
    outputFormat,
    getConfig(),
    pathToOutputFile
  );
};
