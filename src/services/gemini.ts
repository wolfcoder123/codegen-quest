import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeProblem, EvaluationResult } from "@/types/code";

const GEMINI_API_KEY = "AIzaSyCwFtO6agPTzedSEA_WKx3E29hKDP_a3b4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function evaluateCode(code: string, problem: CodeProblem): Promise<EvaluationResult> {
  if (!code || code.trim() === '') {
    throw new Error("No code submitted for evaluation");
  }

  console.log("Evaluating code:", code); // Debug log
  console.log("Problem:", problem.title); // Debug log

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    You are an expert code reviewer analyzing a solution for this coding problem:
    
    PROBLEM:
    ${problem.title}
    ${problem.description}
    
    Constraints:
    ${problem.constraints.join('\n')}
    
    Test Cases:
    ${JSON.stringify(problem.testCases, null, 2)}
    
    USER'S SUBMITTED CODE:
    ${code}

    Perform a comprehensive technical analysis of this code submission. Focus on:

    1. Test Case Validation:
    - Run each test case through the code
    - Compare outputs with expected results
    - Calculate pass/fail ratio
    - Identify any edge cases not covered
    
    2. Code Quality Analysis:
    - Evaluate code structure and organization
    - Check for proper error handling
    - Assess variable naming and documentation
    - Analyze modularity and reusability
    
    3. Performance Analysis:
    - Calculate precise time complexity
    - Measure space complexity
    - Identify specific performance bottlenecks
    - Suggest concrete optimizations
    
    4. Technical Proficiency:
    - Evaluate algorithm selection
    - Assess data structure usage
    - Review design patterns implementation
    - Check for language-specific best practices
    
    5. Problem-Solving Approach:
    - Analyze the overall solution strategy
    - Evaluate trade-off decisions
    - Assess scalability considerations
    - Review architectural choices

    Return a detailed JSON object with this exact structure (no markdown, no backticks):
    {
      "score": <overall score 0-100>,
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
    
    console.log("Raw Gemini response:", response.text()); // Debug log
    
    const cleanedResponse = response.text()
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    try {
      const evaluation = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (!evaluation.score || !evaluation.problemSolvingScore || !evaluation.codeQualityScore) {
        throw new Error("Invalid evaluation response structure");
      }
      
      // Ensure all scores are numbers between 0-100
      evaluation.score = Math.min(100, Math.max(0, Number(evaluation.score)));
      evaluation.problemSolvingScore.score = Math.min(100, Math.max(0, Number(evaluation.problemSolvingScore.score)));
      evaluation.codeQualityScore.score = Math.min(100, Math.max(0, Number(evaluation.codeQualityScore.score)));
      evaluation.technicalProficiency.score = Math.min(100, Math.max(0, Number(evaluation.technicalProficiency.score)));
      
      // Ensure arrays exist
      evaluation.testCaseResults = evaluation.testCaseResults || [];
      evaluation.securityConsiderations = evaluation.securityConsiderations || [];
      
      console.log("Processed evaluation:", evaluation); // Debug log
      
      return evaluation;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response:", cleanedResponse);
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error evaluating code:", error);
    throw error;
  }
}