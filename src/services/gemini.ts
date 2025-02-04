import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeProblem, EvaluationResult } from "@/types/code";

const GEMINI_API_KEY = "AIzaSyCwFtO6agPTzedSEA_WKx3E29hKDP_a3b4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function evaluateCode(code: string, problem: CodeProblem): Promise<EvaluationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    As an expert code reviewer, analyze this solution for ${problem.title} with extreme attention to detail:

    USER'S CODE:
    ${code}

    PROBLEM REQUIREMENTS:
    ${problem.description}

    Perform a thorough analysis focusing on:
    1. Problem-Solving Approach:
       - How well did they understand and tackle the core problem?
       - What unique or creative solutions did they implement?
       - Did they consider all edge cases?

    2. Code Quality & Architecture:
       - Specific design patterns used
       - Code organization and modularity
       - Naming conventions and readability
       - Use of language-specific features

    3. Performance Analysis:
       - Detailed time complexity with examples
       - Space complexity analysis
       - Specific bottlenecks identified
       - Optimization opportunities

    4. Technical Proficiency:
       - Advanced language features used
       - Framework/library knowledge demonstrated
       - Best practices followed
       - Areas showing expertise

    5. Areas for Growth:
       - Specific code sections that could be improved
       - Missing optimizations
       - Security considerations
       - Error handling improvements

    Return ONLY a JSON object with this exact structure (no markdown, no backticks):
    {
      "score": number between 0-100,
      "executionTime": number in milliseconds,
      "memory": number in KB,
      "problemSolvingScore": {
        "score": number,
        "approach": string,
        "creativity": string,
        "edgeCases": string[]
      },
      "codeQualityScore": {
        "score": number,
        "patterns": string[],
        "strengths": string[],
        "suggestions": string[]
      },
      "technicalProficiency": {
        "score": number,
        "advancedFeatures": string[],
        "bestPractices": string[],
        "areasOfExpertise": string[]
      },
      "performanceMetrics": {
        "timeComplexity": string,
        "spaceComplexity": string,
        "bottlenecks": string[],
        "optimizations": string[]
      },
      "testCaseResults": [{
        "passed": boolean,
        "input": string,
        "expectedOutput": string,
        "actualOutput": string,
        "executionTime": number
      }],
      "securityConsiderations": string[],
      "overallFeedback": string
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
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