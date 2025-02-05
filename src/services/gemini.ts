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

    Evaluate the code and return a JSON object with the following structure (NO comments, NO markdown, ONLY valid JSON):
    {
      "score": <overall score between 0-100>,
      "executionTime": <estimated execution time in ms>,
      "memory": <estimated memory usage in MB>,
      "problemSolvingScore": {
        "score": <score between 0-100>,
        "approach": "<detailed analysis of problem-solving approach>",
        "creativity": "<analysis of creative solutions and innovative thinking>",
        "edgeCases": ["<list of edge cases handled or missed>"]
      },
      "codeQualityScore": {
        "score": <score between 0-100>,
        "patterns": ["<list of design patterns used>"],
        "strengths": ["<detailed list of code strengths>"],
        "suggestions": ["<specific improvement suggestions>"]
      },
      "technicalProficiency": {
        "score": <score between 0-100>,
        "advancedFeatures": ["<list of advanced language features used>"],
        "bestPractices": ["<list of best practices followed>"],
        "areasOfExpertise": ["<areas where code shows expertise>"]
      },
      "performanceMetrics": {
        "timeComplexity": "<Big O notation>",
        "spaceComplexity": "<Big O notation>",
        "bottlenecks": ["<list of performance bottlenecks>"],
        "optimizations": ["<suggested optimizations>"]
      },
      "testCaseResults": [{
        "passed": <boolean>,
        "input": "<test input>",
        "expectedOutput": "<expected output>",
        "actualOutput": "<actual output>",
        "executionTime": <time in ms>
      }],
      "securityConsiderations": ["<list of security considerations>"],
      "overallFeedback": "<comprehensive feedback>"
    }

    Ensure the response:
    1. Is VALID JSON (no comments, no markdown)
    2. Includes detailed analysis in each section
    3. Provides specific, actionable feedback
    4. Covers all aspects of code quality
    5. Identifies both strengths and areas for improvement
    6. Suggests concrete optimization strategies
    7. Evaluates algorithmic complexity accurately`;

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
      
      // Validate and normalize required fields
      if (!evaluation.score || typeof evaluation.score !== 'number') {
        throw new Error("Invalid score in evaluation response");
      }
      
      // Normalize scores to 0-100 range
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
      evaluation.codeQualityScore = evaluation.codeQualityScore || {};
      evaluation.codeQualityScore.patterns = evaluation.codeQualityScore.patterns || [];
      evaluation.codeQualityScore.strengths = evaluation.codeQualityScore.strengths || [];
      evaluation.codeQualityScore.suggestions = evaluation.codeQualityScore.suggestions || [];
      evaluation.technicalProficiency = evaluation.technicalProficiency || {};
      evaluation.technicalProficiency.advancedFeatures = evaluation.technicalProficiency.advancedFeatures || [];
      evaluation.technicalProficiency.bestPractices = evaluation.technicalProficiency.bestPractices || [];
      evaluation.technicalProficiency.areasOfExpertise = evaluation.technicalProficiency.areasOfExpertise || [];
      evaluation.performanceMetrics = evaluation.performanceMetrics || {};
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