export interface CodeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  timeLimit: number;
  testCases: TestCase[];
  constraints: string[];
  examples: Example[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Example {
  input: string;
  output: string;
  explanation: string;
}

export interface CodeSubmission {
  code: string;
  language: string;
  problemId: string;
}

export interface EvaluationResult {
  score: number;
  executionTime: number;
  memory: number;
  feedback: string;
  testCaseResults: TestCaseResult[];
  strengths: string[];
  weaknesses: string[];
  optimizationSuggestions: string[];
  securityConsiderations: string[];
  scalabilityAnalysis: string;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
}