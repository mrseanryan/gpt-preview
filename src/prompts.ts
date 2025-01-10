export const buildSystemPromptToOutputDot = (llmOutput: string): string => {
  return "You are an expert on generating summaries of complex output from another LLM.\
    Take the following output, and generate a DOT file that represents the output:\
  \
  OTHER-LLM OUTPUT:\
  ```\
  {LLM_OUTPUT}\
  ```\
  \
  The output MUST be like this example:\
  ```DOT\
  {\
  \
  }\
  ```\
  \
  ".replace("{LLM_OUTPUT}", llmOutput);
};

export const buildSystemPromptToOutputJson = (llmOutput: string): string => {
  return "You are an expert on generating summaries of complex output from another LLM.\
    Take the following output, and generate a JSON summary that represents the output:\
  \
  OTHER-LLM OUTPUT:\
  ```\
  {LLM_OUTPUT}\
  ```\
  \
  The output MUST be like this example:\
  ```JSON\
  {\
    title: <title>,\
    short_summary: <short summary>,\
    long_summary: <long summary>,\
  \
  }\
  ```\
  \
  ".replace("{LLM_OUTPUT}", llmOutput);
};
