import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeProblem, EvaluationResult } from "@/types/code";

const GEMINI_API_KEY = "AIzaSyCwFtO6agPTzedSEA_WKx3E29hKDP_a3b4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function evaluateCode(code: string, problem: CodeProblem): Promise<EvaluationResult> {
  if (!code || code.trim() === '') {
    throw new Error("No code submitted for evaluation");
  }

  console.log("Evaluating code:", code);
  console.log("Problem:", problem.title);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    You are an expert code evaluator. Analyze this code submission thoroughly and provide a detailed evaluation.
    
    PROBLEM:
    ${problem.title}
    ${problem.description}
    
    USER'S CODE:
    ${code}

    Provide a detailed analysis in valid JSON format with NO COMMENTS. Include:
    1. Overall score and metrics
    2. Problem-solving approach analysis
    3. Code quality evaluation
    4. Technical proficiency assessment
    5. Performance analysis
    6. Security considerations
    7. Specific strengths and areas for improvement
    8. Best practices followed and violated
    9. Code architecture and design patterns
    10. Scalability and maintainability analysis

    Return ONLY a JSON object with this structure (no markdown, no comments, no backticks):
    {
      "score": number,
      "executionTime": number,
      "memory": number,
      "problemSolvingScore": {
        "score": number,
        "approach": "string",
        "creativity": "string",
        "edgeCases": ["string"]
      },
      "codeQualityScore": {
        "score": number,
        "patterns": ["string"],
        "strengths": ["string"],
        "suggestions": ["string"]
      },
      "technicalProficiency": {
        "score": number,
        "advancedFeatures": ["string"],
        "bestPractices": ["string"],
        "areasOfExpertise": ["string"]
      },
      "performanceMetrics": {
        "timeComplexity": "string",
        "spaceComplexity": "string",
        "bottlenecks": ["string"],
        "optimizations": ["string"]
      },
      "testCaseResults": [{
        "passed": boolean,
        "input": "string",
        "expectedOutput": "string",
        "actualOutput": "string",
        "executionTime": number
      }],
      "securityConsiderations": ["string"],
      "overallFeedback": "string"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log("Raw Gemini response:", response.text());
    
    // Remove any potential markdown formatting or comments
    const cleanedResponse = response.text()
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/\/\/.*/g, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .trim();

    try {
      const evaluation = JSON.parse(cleanedResponse);
      
      // Validate required fields and normalize scores
      if (!evaluation.score || typeof evaluation.score !== 'number') {
        throw new Error("Invalid score in evaluation response");
      }
      
      evaluation.score = Math.min(100, Math.max(0, Number(evaluation.score)));
      
      if (evaluation.problemSolvingScore) {
        evaluation.problemSolvingScore.score = Math.min(100, Math.max(0, Number(evaluation.problemSolvingScore.score)));
      }
      
      if (evaluation.codeQualityScore) {
        evaluation.codeQualityScore.score = Math.min(100, Math.max(0, Number(evaluation.codeQualityScore.score)));
      }
      
      if (evaluation.technicalProficiency) {
        evaluation.technicalProficiency.score = Math.min(100, Math.max(0, Number(evaluation.technicalProficiency.score)));
      }
      
      // Ensure arrays exist even if empty
      evaluation.testCaseResults = evaluation.testCaseResults || [];
      evaluation.securityConsiderations = evaluation.securityConsiderations || [];
      evaluation.codeQualityScore.patterns = evaluation.codeQualityScore.patterns || [];
      evaluation.codeQualityScore.strengths = evaluation.codeQualityScore.strengths || [];
      evaluation.codeQualityScore.suggestions = evaluation.codeQualityScore.suggestions || [];
      evaluation.technicalProficiency.advancedFeatures = evaluation.technicalProficiency.advancedFeatures || [];
      evaluation.technicalProficiency.bestPractices = evaluation.technicalProficiency.bestPractices || [];
      evaluation.technicalProficiency.areasOfExpertise = evaluation.technicalProficiency.areasOfExpertise || [];
      evaluation.performanceMetrics.bottlenecks = evaluation.performanceMetrics.bottlenecks || [];
      evaluation.performanceMetrics.optimizations = evaluation.performanceMetrics.optimizations || [];
      
      console.log("Processed evaluation:", evaluation);
      
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