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
  success: boolean;
  score: number;
  executionTime: number;
  memory: number;
  testCaseResults: TestCaseResult[];
  feedback: string;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
}