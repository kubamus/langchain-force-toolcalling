import { ChatOllama } from "@langchain/ollama";
import { tools } from "./tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { config } from "../config";
import { parseResponse } from "./functions";

const toolsDescription = `${tools.map((tool) => `${tool.name}: ${tool.description}: ${tool.schema}\n`)}`;

const prompt = `You are a helpful assistant with access to the following tools:
${toolsDescription}

When responding to a question, you have two options:

1. If you need to use tools to answer the question, respond with ONLY a JSON object:
{"isMessage": false, "tools": [{"tool_name": "tool_name_here", "arguments": {"param1": "value1"}}]}

2. If you want to provide a direct response without using tools, respond with ONLY a JSON object:
{"isMessage": true, "content": "your response here"}

IMPORTANT: Return ONLY the JSON object, no code blocks, no markdown formatting, no explanations, no backticks.

Example for single tool call:
{"isMessage": false, "tools": [{"tool_name": "calculator", "arguments": {"operation": "multiply", "number1": 6, "number2": 7}}]}

Example for multiple tool calls:
{"isMessage": false, "tools": [{"tool_name": "calculator", "arguments": {"operation": "add", "number1": 5, "number2": 3}}, {"tool_name": "weather", "arguments": {"location": "New York"}}]}

Example for direct message:
{"isMessage": true, "content": "Hello! I'm here to help you with any questions you have."}`;

const model = new ChatOllama({ model: config.model, baseUrl: config.baseUrl });

try {
  let chatMessages = [
    new SystemMessage(prompt),
    new HumanMessage(config.prompt),
  ];

  const response = await model.invoke(chatMessages);
  const results = await parseResponse(response.content as string);
  if(results.isToolResponse) {
    chatMessages.push(new SystemMessage("Tools called successfully. Results: " + JSON.stringify(results, null, 2)));

    chatMessages.push(new SystemMessage("Now, using the results from the tools, provide a final answer. You don't need to response in a valid JSON format, just provide the final answer."));
    const finalResponse = await model.invoke(chatMessages);
    console.log(finalResponse.content);
  } else {
    console.log(results.content);
  }
} catch (error) {
  console.error("❌| =ERROR TOOL CALLING= |❌")
  console.error(error);
  console.error("❌| ==================== |❌")
}