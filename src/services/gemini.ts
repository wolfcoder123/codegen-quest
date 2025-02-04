import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCwFtO6agPTzedSEA_WKx3E29hKDP_a3b4";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function evaluateCode(code: string, problem: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Evaluate this code solution for the following problem:
      ${problem.description}

      Code:
      ${code}

      Provide a detailed analysis including:
      1. Correctness
      2. Time complexity
      3. Space complexity
      4. Code quality
      5. Best practices
      6. Potential improvements

      Return ONLY a JSON object with this exact structure (no markdown, no backticks):
      {
        "score": number between 0-100,
        "executionTime": number in milliseconds,
        "memory": number in KB,
        "feedback": string with analysis,
        "testCaseResults": [
          {
            "passed": boolean,
            "input": string,
            "expectedOutput": string,
            "actualOutput": string,
            "executionTime": number
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Clean up the response text by removing any markdown formatting
    const cleanedResponse = response.text()
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse response:", cleanedResponse);
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error evaluating code:", error);
    throw error;
  }
}