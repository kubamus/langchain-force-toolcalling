import { ChatOllama } from "@langchain/ollama";
import { tools } from "./tools";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { config } from "../config";

const toolsDescription = `${tools.map((tool) => `${tool.name}: ${tool.description}: ${tool.schema}\n`)}`;

const prompt = `
You are a helpful assistant with access to the following tools:
${toolsDescription}

When asked a question, respond with ONLY a raw JSON array containing objects for each tool you want to call:
- tool_name: the name of the tool to use
- arguments: the parameters for the tool

IMPORTANT: Return ONLY the JSON array, no code blocks, no markdown formatting, no explanations, no backticks.

Example for single tool call:
[{"tool_name": "calculator", "arguments": {"operation": "multiply", "number1": 6, "number2": 7}}]

Example for multiple tool calls:
[{"tool_name": "calculator", "arguments": {"operation": "add", "number1": 5, "number2": 3}}, {"tool_name": "weather", "arguments": {"location": "New York"}}]`;

const model = new ChatOllama({ model: config.model, baseUrl: config.baseUrl });
try {
  let chatMessages = [
    new SystemMessage(prompt),
    new HumanMessage(config.prompt),
  ];

  const response = await model.invoke(chatMessages);
  let responseContent = response.content as string;
  responseContent = responseContent.trim();
  if (responseContent.startsWith("```json")) {
    responseContent = responseContent.slice(7).trim();
  }
  if (responseContent.endsWith("```")) {
    responseContent = responseContent.slice(0, -3).trim();
  }
  const toolCalls = JSON.parse(responseContent);
  const results: {toolName: string, result: any}[] = [];
  for (const call of toolCalls) {
    const tool = tools.find(t => t.name === call.tool_name);
    if (!tool) {
      console.error(`Tool not found: ${call.tool_name}`);
      continue;
    }
    const result = await (tool as any).invoke(call.arguments);
    results.push({ toolName: call.tool_name, result });
  }
  chatMessages.push(new SystemMessage("Tools called successfully. Results: " + JSON.stringify(results, null, 2)));

  chatMessages.push(new SystemMessage("Now, using the results from the tools, provide a final answer. You don't need to response in a valid JSON format, just provide the final answer."));
  const finalResponse = await model.invoke(chatMessages);
  console.log(finalResponse.content);

} catch (error) {
  console.error("❌| =ERROR TOOL CALLING= |❌")
  console.error(error);
  console.error("❌| ==================== |❌")
}