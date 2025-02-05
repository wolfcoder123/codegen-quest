import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CodeEditor from '@/components/CodeEditor';
import Timer from '@/components/Timer';
import { evaluateCode } from '@/services/gemini';
import { CodeProblem, EvaluationResult } from '@/types/code';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Code2, Cpu } from "lucide-react";

const sampleProblem: CodeProblem = {
  id: "1",
  title: "Distributed Rate Limiter Design",
  description: `Design and implement a distributed rate limiter that can handle millions of requests per second across multiple datacenters. The system should:

1. Enforce rate limits across a distributed system with eventual consistency
2. Handle network partitions and node failures gracefully
3. Minimize false positives/negatives in rate limit decisions
4. Support multiple rate limit algorithms (token bucket, leaky bucket, sliding window)
5. Provide real-time analytics on rate limit violations
6. Scale horizontally with minimal coordination overhead
7. Support different rate limits for different API endpoints/users
8. Handle clock skew between nodes

Your solution must be production-ready, handling all edge cases and failure scenarios.`,
  difficulty: "Expert",
  timeLimit: 3600,
  testCases: [
    {
      input: `{
  "requests": [
    {"timestamp": 1645084800, "userId": "user1", "endpoint": "/api/v1/search"},
    {"timestamp": 1645084801, "userId": "user1", "endpoint": "/api/v1/search"},
    {"timestamp": 1645084802, "userId": "user1", "endpoint": "/api/v1/search"}
  ],
  "rateLimits": {
    "/api/v1/search": {"requests": 2, "window": "1s"}
  }
}`,
      expectedOutput: `{
  "allowed": [true, true, false],
  "retryAfter": [null, null, 1000],
  "remaining": [1, 0, 0]
}`
    }
  ],
  constraints: [
    "Maximum latency: 10ms per request",
    "Memory usage: < 1GB per node",
    "Network bandwidth: < 100MB/s per node",
    "Consistency delay: < 100ms",
    "False positive rate: < 0.01%",
    "Availability: 99.99%",
    "Support for 100+ million unique users",
    "Handle 1M+ requests/second per node"
  ],
  examples: [
    {
      input: "Burst of 1000 requests from user1 in 100ms",
      output: "Only first 10 requests allowed, others rate limited",
      explanation: "Token bucket algorithm correctly throttles burst traffic while allowing legitimate requests"
    }
  ]
};

export default function Index() {
  const [code, setCode] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!code || code.trim() === '') {
      toast({
        title: "No Code Submitted",
        description: "Please write some code before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEvaluating(true);
      console.log("Submitting code for evaluation:", code); // Debug log
      
      const evaluation = await evaluateCode(code, sampleProblem);
      console.log("Received evaluation:", evaluation); // Debug log
      
      if (!evaluation || typeof evaluation.score !== 'number') {
        throw new Error("Invalid evaluation result");
      }
      
      setResult(evaluation);
      
      // Store complete evaluation data
      localStorage.setItem('evaluationResult', JSON.stringify(evaluation));
      localStorage.setItem('submittedCode', code);
      localStorage.setItem('problemDetails', JSON.stringify(sampleProblem));
      
      navigate('/results');
    } catch (error) {
      console.error("Evaluation error:", error);
      toast({
        title: "Evaluation Failed",
        description: error instanceof Error ? error.message : "An error occurred while evaluating your code.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {sampleProblem.title}
            </h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-semibold">
                {sampleProblem.difficulty}
              </span>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <Timer duration={sampleProblem.timeLimit} onComplete={handleSubmit} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gray-800/50 backdrop-blur border-gray-700/50">
            <div className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-cyan-400">
                  <Code2 className="w-5 h-5" />
                  Problem Description
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {sampleProblem.description}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Constraints</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {sampleProblem.constraints.map((constraint, index) => (
                    <li key={index} className="text-red-400">{constraint}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Examples</h3>
                {sampleProblem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                    <div className="font-mono text-sm">
                      <span className="text-gray-400">Input: </span>
                      <span className="text-green-400">{example.input}</span>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-gray-400">Output: </span>
                      <span className="text-blue-400">{example.output}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      {example.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="h-[600px] rounded-lg overflow-hidden border border-gray-700/50 glass-morphism">
              <CodeEditor
                value={code}
                onChange={setCode}
                language="javascript"
                className="h-full"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-gray-300"
                onClick={() => setCode("")}
              >
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isEvaluating}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isEvaluating ? (
                  <>
                    <Cpu className="mr-2 h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  "Submit Solution"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}