import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { EvaluationResult, CodeProblem } from '@/types/code';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Check, AlertTriangle, Brain, Shield, Zap, Code, Bug, Cpu, Star, Lightbulb, Target, Rocket } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Results() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [code, setCode] = useState<string>("");
  const [problem, setProblem] = useState<CodeProblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedResult = localStorage.getItem('evaluationResult');
      const storedCode = localStorage.getItem('submittedCode');
      const storedProblem = localStorage.getItem('problemDetails');
      
      if (!storedResult || !storedCode || !storedProblem) {
        throw new Error("Missing evaluation data");
      }
      
      const parsedResult = JSON.parse(storedResult);
      const parsedProblem = JSON.parse(storedProblem);
      
      // Validate the parsed result
      if (!parsedResult.score || typeof parsedResult.score !== 'number') {
        throw new Error("Invalid evaluation result format");
      }
      
      setResult(parsedResult);
      setCode(storedCode);
      setProblem(parsedProblem);
    } catch (error) {
      console.error("Error loading results:", error);
      toast({
        title: "Error Loading Results",
        description: "Could not load evaluation results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold animate-pulse flex items-center gap-3">
          <Cpu className="w-6 h-6 animate-spin" />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Analyzing Your Code...
          </span>
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
    { 
      name: 'Problem Solving', 
      value: result.problemSolvingScore?.score || 0,
      color: '#22d3ee'
    },
    { 
      name: 'Code Quality', 
      value: result.codeQualityScore?.score || 0,
      color: '#818cf8'
    },
    { 
      name: 'Technical Proficiency', 
      value: result.technicalProficiency?.score || 0,
      color: '#c084fc'
    },
    { 
      name: 'Overall Score', 
      value: result.score || 0,
      color: '#34d399'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Code Analysis Results
          </h1>
          <p className="text-gray-400">Comprehensive evaluation of your solution</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-400" />
              Performance Overview
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Bar dataKey="value" fill="#22d3ee" />
                  <ChartTooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Problem-Solving Approach
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg backdrop-blur-sm border border-cyan-500/10">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Approach</h3>
                <p className="text-gray-300">{result.problemSolvingScore?.approach}</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg backdrop-blur-sm border border-purple-500/10">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Creative Solutions</h3>
                <p className="text-gray-300">{result.problemSolvingScore?.creativity}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-cyan-400" />
              Technical Excellence
            </h2>
            <div className="grid gap-4">
              {result.technicalProficiency?.areasOfExpertise.map((area, index) => (
                <div key={index} className="flex items-start gap-2 bg-gray-900/30 p-3 rounded-lg backdrop-blur-sm border border-cyan-500/10">
                  <Rocket className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">{area}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-cyan-400" />
              Areas for Growth
            </h2>
            <div className="grid gap-4">
              {result.codeQualityScore?.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 bg-gray-900/30 p-3 rounded-lg backdrop-blur-sm border border-yellow-500/10">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">{suggestion}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              Performance Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Time & Space Complexity
                </h3>
                <div className="bg-gray-900/30 p-4 rounded-lg backdrop-blur-sm border border-green-500/10">
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      Time: {result.performanceMetrics?.timeComplexity}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      Space: {result.performanceMetrics?.spaceComplexity}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Performance Bottlenecks
                </h3>
                <div className="bg-gray-900/30 p-4 rounded-lg backdrop-blur-sm border border-yellow-500/10">
                  <ul className="space-y-2">
                    {result.performanceMetrics?.bottlenecks.map((bottleneck, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-yellow-400">•</span>
                        {bottleneck}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Optimization Suggestions
                </h3>
                <div className="bg-gray-900/30 p-4 rounded-lg backdrop-blur-sm border border-purple-500/10">
                  <ul className="space-y-2">
                    {result.performanceMetrics?.optimizations.map((optimization, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-purple-400">•</span>
                        {optimization}
                      </li>
                    ))}
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
