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
    You are an expert code evaluator. Analyze this code submission and provide a detailed evaluation.
    Focus on giving specific, actionable feedback about code quality and improvements.
    
    PROBLEM:
    ${problem.title}
    ${problem.description}
    
    USER'S CODE:
    ${code}

    IMPORTANT: Return ONLY a valid JSON object with NO comments, NO markdown, NO urls, and NO special characters in strings.
    The JSON object should include all previous fields plus a new techStack object with this structure:
    {
      "score": <0-100>,
      "executionTime": <ms>,
      "memory": <MB>,
      "problemSolvingScore": {
        "score": <0-100>,
        "approach": "<analysis>",
        "creativity": "<analysis>",
        "edgeCases": ["<list>"]
      },
      "codeQualityScore": {
        "score": <0-100>,
        "patterns": ["<list>"],
        "strengths": ["<list>"],
        "suggestions": ["<list>"]
      },
      "technicalProficiency": {
        "score": <0-100>,
        "advancedFeatures": ["<list>"],
        "bestPractices": ["<list>"],
        "areasOfExpertise": ["<list>"],
        "improvementAreas": ["<list>"]
      },
      "performanceMetrics": {
        "timeComplexity": "<text>",
        "spaceComplexity": "<text>",
        "bottlenecks": ["<list>"],
        "optimizations": ["<list>"]
      },
      "codeAnalysis": {
        "strengths": ["<list>"],
        "weaknesses": ["<list>"],
        "bestPractices": ["<list>"],
        "improvements": ["<list>"]
      },
      "securityConsiderations": ["<list>"],
      "overallFeedback": "<text>",
      "learningResources": ["<text>"],
      "techStack": {
        "frontend": ["<list of frontend technologies>"],
        "backend": ["<list of backend technologies>"],
        "databases": ["<list of databases>"],
        "tools": ["<list of tools and infrastructure>"],
        "codeHighlights": [
          {
            "description": "<what this code snippet demonstrates>",
            "code": "<3-4 lines of notable code>",
            "language": "<programming language>"
          }
        ]
      }
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
      .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      .trim();

    try {
      const evaluation = JSON.parse(cleanedResponse);
      
      // Normalize and validate all scores to be between 0-100
      const normalizeScore = (score: any) => {
        const num = Number(score);
        return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
      };
      
      evaluation.score = normalizeScore(evaluation.score);
      
      if (evaluation.problemSolvingScore) {
        evaluation.problemSolvingScore.score = normalizeScore(evaluation.problemSolvingScore.score);
      }
      
      if (evaluation.codeQualityScore) {
        evaluation.codeQualityScore.score = normalizeScore(evaluation.codeQualityScore.score);
      }
      
      if (evaluation.technicalProficiency) {
        evaluation.technicalProficiency.score = normalizeScore(evaluation.technicalProficiency.score);
      }
      
      // Ensure all required objects exist with default values
      evaluation.problemSolvingScore = evaluation.problemSolvingScore || {
        score: 0,
        approach: "No approach analysis provided",
        creativity: "No creativity analysis provided",
        edgeCases: []
      };
      
      evaluation.codeQualityScore = evaluation.codeQualityScore || {
        score: 0,
        patterns: [],
        strengths: [],
        suggestions: []
      };
      
      evaluation.technicalProficiency = evaluation.technicalProficiency || {
        score: 0,
        advancedFeatures: [],
        bestPractices: [],
        areasOfExpertise: [],
        improvementAreas: []
      };
      
      evaluation.performanceMetrics = evaluation.performanceMetrics || {
        timeComplexity: "Not analyzed",
        spaceComplexity: "Not analyzed",
        bottlenecks: [],
        optimizations: []
      };
      
      evaluation.codeAnalysis = evaluation.codeAnalysis || {
        strengths: [],
        weaknesses: [],
        bestPractices: [],
        improvements: []
      };
      
      // Ensure all arrays exist
      evaluation.securityConsiderations = evaluation.securityConsiderations || [];
      evaluation.learningResources = evaluation.learningResources || [];
      
      // Set default values for required fields
      evaluation.executionTime = evaluation.executionTime || 0;
      evaluation.memory = evaluation.memory || 0;
      evaluation.overallFeedback = evaluation.overallFeedback || "No feedback provided";

      // Clean string fields
      const cleanString = (str: string) => {
        return str.replace(/[^\x20-\x7E]/g, '').trim();
      };

      evaluation.overallFeedback = cleanString(evaluation.overallFeedback);
      evaluation.problemSolvingScore.approach = cleanString(evaluation.problemSolvingScore.approach);
      evaluation.problemSolvingScore.creativity = cleanString(evaluation.problemSolvingScore.creativity);
      evaluation.performanceMetrics.timeComplexity = cleanString(evaluation.performanceMetrics.timeComplexity);
      evaluation.performanceMetrics.spaceComplexity = cleanString(evaluation.performanceMetrics.spaceComplexity);
      
      // Add techStack validation
      evaluation.techStack = evaluation.techStack || {
        frontend: [],
        backend: [],
        databases: [],
        tools: [],
        codeHighlights: []
      };

      return evaluation;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response:", cleanedResponse);
      throw new Error("Failed to parse evaluation results. Please try again.");
    }
  } catch (error) {
    console.error("Error evaluating code:", error);
    throw error;
  }
}

export async function generateQuestion(): Promise<CodeProblem> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate an extremely challenging coding question about distributed systems or modern web architecture.
    Return ONLY a valid JSON object with NO comments, NO markdown, NO urls, and NO special characters in strings.
    
    The JSON must have this structure:
    {
      "id": "<unique id>",
      "title": "<title>",
      "description": "<description>",
      "difficulty": "Expert",
      "timeLimit": 3600,
      "testCases": [
        {
          "input": "<input>",
          "expectedOutput": "<output>"
        }
      ],
      "constraints": ["<list>"],
      "examples": [
        {
          "input": "<input>",
          "output": "<output>",
          "explanation": "<text>"
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
      .replace(/https?:\/\/[^\s"\]]+/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[^\x00-\x7F]/g, "")
      .trim();

    try {
      const question = JSON.parse(cleanedResponse);
      
      // Clean string fields
      const cleanString = (str: string) => {
        return str.replace(/[^\x20-\x7E]/g, '').trim();
      };

      question.title = cleanString(question.title);
      question.description = cleanString(question.description);
      
      // Ensure arrays exist
      question.testCases = question.testCases || [];
      question.constraints = question.constraints || [];
      question.examples = question.examples || [];
      
      return question;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response:", cleanedResponse);
      throw new Error("Failed to generate question. Please try again.");
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
}
