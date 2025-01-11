# gpt-preview README

A Node.js library and dev tool for previewing the output of an LLM or AI Agent (using an LLM)

- take complex output such as Function Calls or GraphQL mutations, and generate easy to view 'previews'
- can be used as a library in an AI application, to provide user with a preview of the AI actions, before the user actually agrees to apply the actions.
- can be used as a dev tool, by taking the AI output and pasting it into a locally run website.

[![npm Package](https://img.shields.io/npm/v/gpt-preview.svg?style=flat-square)](https://www.npmjs.org/package/gpt-preview)
[![NPM Downloads](https://img.shields.io/npm/dm/gpt-preview.svg)](https://npmjs.org/package/gpt-preview)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K73ALBJ)

# Setup

- [Node](https://nodejs.org/en/download/package-manager) v20.18+

```
./install.sh
```

- Configure LLM via the [config file](./config.gpt-preview.json).

# Usage [as command line tool]

```
./go.sh <path to text file containing the LLM output> [OPTIONS]
```

```
- where OPTIONS are:
    -f=<DOT|JSON> (default is DOT)
    -o=<path to output file>
```

- currently can summarize to:

  - DOT (graphviz) format
  - JSON format (containing short and long text summaries)

- currently supports LLM hosted on AWS Bedrock

# Usage [as an npm library]

```
npm install gpt-preview
```

To summarize text in-memory (to a variable 'summary') in JSON format:

```TS
import { OutputFormat, summarizeText } from "gpt-preview";

const config = {
  "platform": "AwsBedrock",
  "isDebug": false,
  "modelId": "eu.anthropic.claude-3-5-sonnet-20240620-v1:0",
  "maxTokens": 2048,
  "temperature": 0.7,
  "top_p": 0.9,
  "awsRegion": "eu-west-1"
}

const summary = summarizeText(
    "My LLM output to summarize",
    OutputFormat.JSON,
    config
    );
```

To summarize a file, in DOT format:

```TS
import { OutputFormat, summarizeFile } from "gpt-preview";

const config = {
  "platform": "AwsBedrock",
  "isDebug": false,
  "modelId": "eu.anthropic.claude-3-5-sonnet-20240620-v1:0",
  "maxTokens": 2048,
  "temperature": 0.7,
  "top_p": 0.9,
  "awsRegion": "eu-west-1"
}

const summary = summarizeFile(
    "./temp/my-LLM-output.txt",
    OutputFormat.DOT,
    config,
    "./temp/my-summary.dot"
    );
```

To use OpenAI instead of AWS Bedrock, simply change the config:

```TS
const config = {
  "platform": "OpenAI",
  "isDebug": false,
  "modelId": "gpt-4o-mini",
  "maxTokens": 2048,
  "temperature": 0.7,
  "top_p": 0.9
}
```
