
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeProblem, EvaluationResult } from "@/types/code";

const GEMINI_API_KEY = "AIzaSyCwFtO6agPTzedSEA_WKx3E29hKDP_a3b4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function evaluateCode(code: string, problem: CodeProblem): Promise<EvaluationResult> {
  if (!code || code.trim() === '') {
    throw new Error("No code submitted for evaluation");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    You are an expert code evaluator. Analyze this code submission thoroughly and provide a detailed evaluation.
    Focus heavily on providing specific, actionable feedback about strengths and areas for improvement.
    
    PROBLEM:
    ${problem.title}
    ${problem.description}
    
    USER'S CODE:
    ${code}

    Return a JSON object with the following structure (NO comments, NO markdown, ONLY valid JSON, NO urls or special characters in strings):
    {
      "score": <overall score between 0-100>,
      "executionTime": <estimated execution time in ms>,
      "memory": <estimated memory usage in MB>,
      "problemSolvingScore": {
        "score": <score between 0-100>,
        "approach": "<brief analysis of problem-solving approach>",
        "creativity": "<brief analysis of creative solutions>",
        "edgeCases": ["<list of edge cases>"]
      },
      "codeQualityScore": {
        "score": <score between 0-100>,
        "patterns": ["<list of patterns>"],
        "strengths": ["<list of strengths>"],
        "suggestions": ["<list of suggestions>"]
      },
      "technicalProficiency": {
        "score": <score between 0-100>,
        "advancedFeatures": ["<list of features>"],
        "bestPractices": ["<list of practices>"],
        "areasOfExpertise": ["<list of areas>"],
        "improvementAreas": ["<list of areas>"]
      },
      "performanceMetrics": {
        "timeComplexity": "<complexity>",
        "spaceComplexity": "<complexity>",
        "bottlenecks": ["<list of bottlenecks>"],
        "optimizations": ["<list of optimizations>"]
      },
      "codeAnalysis": {
        "strengths": ["<list of strengths>"],
        "weaknesses": ["<list of weaknesses>"],
        "bestPractices": ["<list of practices>"],
        "improvements": ["<list of improvements>"]
      },
      "securityConsiderations": ["<list of considerations>"],
      "overallFeedback": "<brief feedback>",
      "learningResources": ["<title of resource>"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    const cleanedResponse = response.text()
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/https?:\/\/[^\s"\]]+/g, '') // Remove URLs
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
      .trim();

    try {
      const evaluation = JSON.parse(cleanedResponse);
      
      // Validate and normalize scores
      if (!evaluation.score || typeof evaluation.score !== 'number') {
        evaluation.score = 0;
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
      
      // Ensure all arrays exist to prevent undefined errors
      evaluation.testCaseResults = evaluation.testCaseResults || [];
      evaluation.securityConsiderations = evaluation.securityConsiderations || [];
      evaluation.learningResources = evaluation.learningResources || [];
      
      evaluation.codeQualityScore = evaluation.codeQualityScore || {};
      evaluation.codeQualityScore.patterns = evaluation.codeQualityScore.patterns || [];
      evaluation.codeQualityScore.strengths = evaluation.codeQualityScore.strengths || [];
      evaluation.codeQualityScore.suggestions = evaluation.codeQualityScore.suggestions || [];
      
      evaluation.technicalProficiency = evaluation.technicalProficiency || {};
      evaluation.technicalProficiency.advancedFeatures = evaluation.technicalProficiency.advancedFeatures || [];
      evaluation.technicalProficiency.bestPractices = evaluation.technicalProficiency.bestPractices || [];
      evaluation.technicalProficiency.areasOfExpertise = evaluation.technicalProficiency.areasOfExpertise || [];
      evaluation.technicalProficiency.improvementAreas = evaluation.technicalProficiency.improvementAreas || [];
      
      evaluation.performanceMetrics = evaluation.performanceMetrics || {};
      evaluation.performanceMetrics.bottlenecks = evaluation.performanceMetrics.bottlenecks || [];
      evaluation.performanceMetrics.optimizations = evaluation.performanceMetrics.optimizations || [];
      
      evaluation.codeAnalysis = evaluation.codeAnalysis || {
        strengths: [],
        weaknesses: [],
        bestPractices: [],
        improvements: []
      };

      // Set default values for required fields if missing
      evaluation.executionTime = evaluation.executionTime || 0;
      evaluation.memory = evaluation.memory || 0;
      evaluation.overallFeedback = evaluation.overallFeedback || "No feedback provided";
      
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

export async function generateQuestion(): Promise<CodeProblem> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate an extremely challenging, complex coding question that addresses real-world problems using modern tech stacks (Next.js, Python, JavaScript, TypeScript) for 2025. 

The question should focus on distributed systems, scalability, or modern web architecture.

Return a JSON object with the following structure (NO comments, NO markdown, ONLY valid JSON, NO urls or special characters):
{
  "id": "<unique id>",
  "title": "<challenging problem title>",
  "description": "<detailed problem description>",
  "difficulty": "Expert",
  "timeLimit": 3600,
  "testCases": [
    {
      "input": "<example input>",
      "expectedOutput": "<expected output>"
    }
  ],
  "constraints": ["<list of technical constraints>"],
  "examples": [
    {
      "input": "<example scenario>",
      "output": "<expected behavior>",
      "explanation": "<detailed explanation>"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    const cleanedResponse = response.text()
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/https?:\/\/[^\s"\]]+/g, '') // Remove URLs
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
      .trim();

    try {
      const question = JSON.parse(cleanedResponse);
      return question;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response:", cleanedResponse);
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
}
