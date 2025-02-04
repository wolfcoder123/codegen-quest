import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { EvaluationResult } from '@/types/code';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Check, AlertTriangle, Brain, Shield, Zap, Code, Bug, Cpu } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold animate-pulse bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Analyzing Code...
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Code Analysis Results
          </h1>
          <p className="text-gray-400">Comprehensive evaluation of your solution</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Performance Metrics
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

          <Card className="p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              Key Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                <div className="text-sm text-gray-400">Execution Time</div>
                <div className="text-2xl font-mono text-cyan-400">
                  {(result.executionTime || 0).toFixed(2)}ms
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                <div className="text-sm text-gray-400">Memory Usage</div>
                <div className="text-2xl font-mono text-cyan-400">
                  {((result.memory || 0) / 1024).toFixed(2)}MB
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                <div className="text-sm text-gray-400">Overall Score</div>
                <div className="text-2xl font-mono text-cyan-400">
                  {result.score}%
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                <div className="text-sm text-gray-400">Test Cases Passed</div>
                <div className="text-2xl font-mono text-cyan-400">
                  {result.testCaseResults.filter(t => t.passed).length}/{result.testCaseResults.length}
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              Code Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Core Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 bg-gray-900/30 p-3 rounded-lg backdrop-blur-sm border border-green-500/10">
                      <Code className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {result.weaknesses?.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 bg-gray-900/30 p-3 rounded-lg backdrop-blur-sm border border-yellow-500/10">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Performance Insights
                </h3>
                <div className="bg-gray-900/30 p-4 rounded-lg backdrop-blur-sm border border-purple-500/10">
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      Time Complexity: O(n log n)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      Space Complexity: O(n)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      Memory Efficiency: High
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}