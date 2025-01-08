export const buildSystemPrompt = (llmOutput: string): string => {
  return "You are an expert on generating summaries of complex output from another LLM.\
    Take the following output, and generate a DOT file that represents the output:\
  \
  OTHER-LLM OUTPUT:\
  ```\
  {LLM_OUTPUT}\
  ```\
  ".replace("{LLM_OUTPUT}", llmOutput);
};
