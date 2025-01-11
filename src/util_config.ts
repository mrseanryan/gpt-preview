import path from "node:path";
import { readJsonFromFile } from "./util_file.js";

export enum Platform {
  OpenAI = "OpenAI",
  AwsBedrock = "AwsBedrock",
}

export interface Config {
  platform: Platform;
  isDebug: boolean;
  modelId: string;
  temperature: number;
  top_p: number;
  awsRegion: string | undefined;
}

export const getConfig = (): Config => {
  const filename = "config.gpt-preview.json";
  const filepath = path.join(process.cwd(), filename);
  return readJsonFromFile(filepath) as Config;
};

let isDebugActiveValue: boolean | undefined = undefined;

export const isDebugActive = (): boolean => {
  if (isDebugActiveValue === undefined) {
    isDebugActiveValue = getConfig().isDebug;
  }
  return isDebugActiveValue;
};

export const toggleIsDebugActive = (): boolean => {
  let oldValue = isDebugActive();
  isDebugActiveValue = !oldValue;
  return isDebugActiveValue;
};
