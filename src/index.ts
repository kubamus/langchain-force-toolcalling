import { ChatOllama } from "@langchain/ollama";
import { tools } from "./tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { config } from "../config";
import { askModel, parseResponse } from "./functions";

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

let chatMessages = [
  new SystemMessage(prompt),
];

process.stdout.write(">>> ")
for await (const line of console) {
  const userInput = line.trim();
  chatMessages.push(new HumanMessage(userInput));
  const response = await askModel(model, chatMessages);
  console.log(response);
  process.stdout.write("\n>>> ")
}