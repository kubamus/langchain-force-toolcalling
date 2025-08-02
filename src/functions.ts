import { tools } from "./tools";

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

export async function parseResponse(response: string): Promise<ToolsResults | TextResponse> {
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
    const toolsCalls = responseObject.tools as Array<{ tool_name: string; arguments: any }>;
    const results: {toolName: string, result: any}[] = [];
    for(const call of toolsCalls) {
      const tool = tools.find(t => t.name === call.tool_name);
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