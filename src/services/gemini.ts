import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeProblem, EvaluationResult } from "@/types/code";

const GEMINI_API_KEY = "AIzaSyCwFtO6agPTzedSEA_WKx3E29hKDP_a3b4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function evaluateCode(code: string, problem: CodeProblem): Promise<EvaluationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    You are an expert code reviewer analyzing a solution for this coding problem:
    
    PROBLEM:
    ${problem.title}
    ${problem.description}
    
    Constraints:
    ${problem.constraints.join('\n')}
    
    USER'S SUBMITTED CODE:
    ${code}

    Perform an extremely detailed technical analysis of this specific code submission. Focus on:

    1. Code Analysis:
       - Evaluate how well the code actually solves the given problem
       - Identify specific algorithmic approaches used
       - Point out any missing edge cases or requirements
       - Analyze error handling and robustness
    
    2. Technical Implementation:
       - Evaluate specific data structures and algorithms used
       - Analyze time and space complexity with detailed explanations
       - Identify performance bottlenecks in THIS specific code
       - Point out any potential memory leaks or resource management issues
    
    3. Code Quality:
       - Evaluate specific design patterns and architectural choices
       - Analyze code organization and modularity
       - Review error handling and edge case coverage
       - Check for proper separation of concerns
    
    4. Problem-Solving Approach:
       - Evaluate the overall strategy used to solve the problem
       - Identify creative or innovative aspects of the solution
       - Point out any missed optimizations
       - Analyze how well the solution scales

    Return a JSON object with this structure (no markdown, no backticks):
    {
      "score": <overall score 0-100 based on actual code quality>,
      "executionTime": <estimated execution time in ms>,
      "memory": <estimated memory usage in KB>,
      "problemSolvingScore": {
        "score": <score 0-100>,
        "approach": "<detailed analysis of problem-solving approach>",
        "creativity": "<specific creative aspects found>",
        "edgeCases": ["<specific edge cases handled or missed>"]
      },
      "codeQualityScore": {
        "score": <score 0-100>,
        "patterns": ["<specific patterns identified>"],
        "strengths": ["<specific code strengths>"],
        "suggestions": ["<specific actionable improvements>"]
      },
      "technicalProficiency": {
        "score": <score 0-100>,
        "advancedFeatures": ["<specific advanced features used>"],
        "bestPractices": ["<specific best practices followed>"],
        "areasOfExpertise": ["<demonstrated areas of expertise>"]
      },
      "performanceMetrics": {
        "timeComplexity": "<detailed big O analysis>",
        "spaceComplexity": "<detailed space complexity>",
        "bottlenecks": ["<specific performance bottlenecks>"],
        "optimizations": ["<specific optimization opportunities>"]
      },
      "testCaseResults": [{
        "passed": <true/false based on actual test case execution>,
        "input": "<test case input>",
        "expectedOutput": "<expected output>",
        "actualOutput": "<actual output from code>",
        "executionTime": <actual execution time in ms>
      }],
      "securityConsiderations": ["<specific security issues found>"],
      "overallFeedback": "<detailed summary of key findings>"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    const cleanedResponse = response.text()
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    try {
      const evaluation = JSON.parse(cleanedResponse);
      
      // Validate the response has required fields
      if (!evaluation.score || !evaluation.problemSolvingScore || !evaluation.codeQualityScore) {
        throw new Error("Invalid evaluation response structure");
      }
      
      return evaluation;
    } catch (parseError) {
      console.error("Failed to parse response:", cleanedResponse);
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error evaluating code:", error);
    throw error;
  }
}