import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { EvaluationResult } from '@/types/code';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Check, AlertTriangle, Brain, Shield, Zap } from "lucide-react";

export default function Results() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedResult = localStorage.getItem('evaluationResult');
    const storedCode = localStorage.getItem('submittedCode');
    
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
    if (storedCode) {
      setCode(storedCode);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-cyan-400">Loading results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-red-400">No results found</div>
      </div>
    );
  }

  const metrics = [
    { name: 'Code Quality', value: result.score },
    { name: 'Performance', value: Math.min(100, 10000 / (result.executionTime || 1)) },
    { name: 'Memory Usage', value: Math.min(100, 1000000 / (result.memory || 1)) },
    { name: 'Test Cases', value: (result.testCaseResults.filter(t => t.passed).length / result.testCaseResults.length) * 100 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
          Code Evaluation Results
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 bg-gray-800/50 backdrop-blur border-gray-700/50">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Performance Analysis
            </h2>
            <div className="h-64">
              <ChartContainer config={{}}>
                <BarChart data={metrics}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Bar dataKey="value" fill="#22d3ee" />
                  <ChartTooltip />
                </BarChart>
              </ChartContainer>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800/50 backdrop-blur border-gray-700/50">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              Key Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">Execution Time</div>
                <div className="text-2xl font-mono text-cyan-400">
                  {(result.executionTime || 0).toFixed(2)}ms
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">Memory Usage</div>
                <div className="text-2xl font-mono text-cyan-400">
                  {((result.memory || 0) / 1024).toFixed(2)}MB
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">Overall Score</div>
                <div className="text-2xl font-mono text-cyan-400">
                  {result.score}%
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">Test Cases Passed</div>
                <div className="text-2xl font-mono text-cyan-400">
                  {result.testCaseResults.filter(t => t.passed).length}/{result.testCaseResults.length}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800/50 backdrop-blur border-gray-700/50 lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              Detailed Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-4">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {result.weaknesses?.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}