import { tool } from "@langchain/core/tools";
import z from "zod";

export const WeatherToolSchema = z.object({
  location: z.string(),
  date: z.string().optional(),
})

export const WeatherTool = tool(
  async(input): Promise<{
    temperature: number,
    description: string,
    humidity: number,
    windSpeed: number,
  }> => {
    const { location, date } = WeatherToolSchema.parse(input);
    return {
      temperature: 15,
      description: `Sunny in ${location}${date ? ` on ${date}` : ""}`,
      humidity: 75,
      windSpeed: 10,
    };
  }, {
    name: "weather",
    description: "A tool to get weather forecasts. Returns temperature in Celsius, humidity as percentage, and wind speed in km/h.",
    schema: WeatherToolSchema,
  }
)
