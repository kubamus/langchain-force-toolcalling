import { tool } from "@langchain/core/tools";
import z from "zod";

export const CalculatorToolSchema = z.object({
  operation: z.enum(["add", "subtract", "multiply", "divide"]),
  number1: z.number(),
  number2: z.number(),
})

export const CalculatorTool = tool(
  async(input): Promise<{ result: number }> => {
    const { operation, number1, number2 } = CalculatorToolSchema.parse(input);
    switch (operation) {
      case "add":
        return { result: number1 + number2 };
      case "subtract":
        return { result: number1 - number2 };
      case "multiply":
        return { result: number1 * number2 };
      case "divide":
        return { result: number1 / number2 };
    }
  }, {
    name: "calculator",
    description: "A tool to perform basic arithmetic operations.",
    schema: CalculatorToolSchema,
  }
)