import { CalculatorTool } from "./tools/CalculatorTool"
import { WeatherTool } from "./tools/WeatherTool"

export const tools = [CalculatorTool, WeatherTool] as const;
export const toolRegistry = new Map(tools.map((t) => [t.name, t]));