import path from "node:path";
import { readJsonFromFile } from "./util_file.js";

export interface Config {
  awsRegion: string;
  isDebug: boolean;
  modelId: string;
  temperature: number;
  top_p: number;
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
