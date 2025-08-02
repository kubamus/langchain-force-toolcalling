import type { ChatOllama } from "@langchain/ollama";
import { tools } from "./tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

interface ToolsResults {
  isToolResponse: true;
  result: {
    toolName: string;
    result: any;
  }[];
}

interface TextResponse {
  isToolResponse: false;
  content: string;
}

export async function parseResponse(
  response: string
): Promise<ToolsResults | TextResponse> {
  response = response.trim();
  if (response.startsWith("```json")) {
    response = response.slice(7).trim();
  }
  if (response.endsWith("```")) {
    response = response.slice(0, -3).trim();
  }

  const responseObject = JSON.parse(response);
  if (responseObject.isMessage === true) {
    return { isToolResponse: false, content: responseObject.content };
  }

  try {
    const toolsCalls = responseObject.tools as Array<{
      tool_name: string;
      arguments: any;
    }>;
    const results: { toolName: string; result: any }[] = [];
    for (const call of toolsCalls) {
      const tool = tools.find((t) => t.name === call.tool_name);
      if (!tool) {
        console.error(`Tool not found: ${call.tool_name}`);
        continue;
      }
      const result = await (tool as any).invoke(call.arguments);
      results.push({ toolName: call.tool_name, result });
    }
    return { isToolResponse: true, result: results };
  } catch (error) {
    console.error("Error parsing response:", error);
    throw error;
  }
}

export async function askModel(
  model: ChatOllama,
  chatMessages: Array<SystemMessage | HumanMessage>
): Promise<string> {
  try {
    const response = await model.invoke(chatMessages);
    const results = await parseResponse(response.content as string);
    if (results.isToolResponse) {
      chatMessages.push(
        new SystemMessage(
          "Tools called successfully. Results: " +
            JSON.stringify(results, null, 2)
        )
      );

      chatMessages.push(
        new SystemMessage(
          "Now, using the results from the tools, provide a final answer. You don't need to response in a valid JSON format, just provide the final answer."
        )
      );
      const finalResponse = await model.invoke(chatMessages);
      return finalResponse.content as string;
    } else {
      return results.content;
    }
  } catch (error) {
    console.error("❌| =ERROR TOOL CALLING= |❌");
    console.error(error);
    console.error("❌| ==================== |❌");
    return "";
  }
}
