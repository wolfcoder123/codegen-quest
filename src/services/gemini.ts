import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeProblem, EvaluationResult } from "@/types/code";

const GEMINI_API_KEY = "AIzaSyCwFtO6agPTzedSEA_WKx3E29hKDP_a3b4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const PROBLEM_GENERATION_PROMPT = `
Generate an extremely complex coding problem that:
1. Solves a real-world distributed systems challenge
2. Requires optimization for high-throughput (1M+ requests/sec)
3. Needs to handle edge cases in low-latency environments
4. Must include concurrency/parallelism challenges
5. Requires efficient memory management

Include:
- Detailed problem statement with real-world context
- 5 technical constraints
- 3 example inputs/outputs with explanations
- 4 progressive technical hints
- 10 hidden test cases with expected outputs

Format as JSON matching the CodeProblem type with:
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "difficulty": "Expert",
  "timeLimit": number,
  "testCases": [{"input": "string", "expectedOutput": "string"}],
  "constraints": ["string"],
  "examples": [{"input": "string", "output": "string", "explanation": "string"}]
}`;

export async function evaluateCode(code: string, problem: CodeProblem): Promise<EvaluationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    Analyze this solution for ${problem.title}:
    ${code}

    Perform comprehensive analysis including:
    1. Code quality and architecture assessment
    2. Time complexity analysis for scale
    3. Space complexity and memory optimization
    4. Concurrency and thread safety evaluation
    5. Error handling and edge cases
    6. Performance optimization opportunities
    7. Security considerations
    8. Best practices adherence

    Return ONLY a JSON object with this exact structure (no markdown, no backticks):
    {
      "score": number between 0-100,
      "executionTime": number in milliseconds,
      "memory": number in KB,
      "feedback": string with detailed analysis,
      "testCaseResults": [{
        "passed": boolean,
        "input": string,
        "expectedOutput": string,
        "actualOutput": string,
        "executionTime": number
      }],
      "strengths": string[],
      "weaknesses": string[],
      "optimizationSuggestions": string[],
      "securityConsiderations": string[],
      "scalabilityAnalysis": string
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Clean up the response text
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