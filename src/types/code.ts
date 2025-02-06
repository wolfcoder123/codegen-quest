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

export interface ProblemSolvingScore {
  score: number;
  approach: string;
  creativity: string;
  edgeCases: string[];
}

export interface CodeQualityScore {
  score: number;
  patterns: string[];
  strengths: string[];
  suggestions: string[];
}

export interface TechnicalProficiency {
  score: number;
  advancedFeatures: string[];
  bestPractices: string[];
  areasOfExpertise: string[];
  improvementAreas: string[];
}

export interface PerformanceMetrics {
  timeComplexity: string;
  spaceComplexity: string;
  bottlenecks: string[];
  optimizations: string[];
}

export interface CodeAnalysis {
  strengths: string[];
  weaknesses: string[];
  bestPractices: string[];
  improvements: string[];
}

export interface TechStackAnalysis {
  frontend: string[];
  backend: string[];
  databases: string[];
  tools: string[];
  codeHighlights: {
    description: string;
    code: string;
    language: string;
  }[];
}

export interface EvaluationResult {
  score: number;
  executionTime: number;
  memory: number;
  problemSolvingScore: ProblemSolvingScore;
  codeQualityScore: CodeQualityScore;
  technicalProficiency: TechnicalProficiency;
  performanceMetrics: PerformanceMetrics;
  testCaseResults: TestCaseResult[];
  securityConsiderations: string[];
  overallFeedback: string;
  codeAnalysis: CodeAnalysis;
  learningResources: string[];
  techStack: TechStackAnalysis;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
}
