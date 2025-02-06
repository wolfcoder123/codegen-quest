import { Card } from "@/components/ui/card";
import { CodeAnalysis } from "@/types/code";
import { Check, X, Book, Lightbulb, Target } from "lucide-react";

interface CodeAnalysisCardProps {
  analysis: CodeAnalysis;
  learningResources: string[];
}

export default function CodeAnalysisCard({ analysis, learningResources }: CodeAnalysisCardProps) {
  return (
    <Card className="p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Target className="w-6 h-6 text-cyan-400" />
        Detailed Code Analysis
      </h2>
      
      <div className="grid gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Code Strengths
          </h3>
          <div className="bg-gray-900/30 p-4 rounded-lg">
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
            <X className="w-5 h-5" />
            Areas for Improvement
          </h3>
          <div className="bg-gray-900/30 p-4 rounded-lg">
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-red-400 mt-1">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Suggested Improvements
          </h3>
          <div className="bg-gray-900/30 p-4 rounded-lg">
            <ul className="space-y-2">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-purple-400 mt-1">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
            <Book className="w-5 h-5" />
            Learning Resources
          </h3>
          <div className="bg-gray-900/30 p-4 rounded-lg">
            <ul className="space-y-2">
              {learningResources.map((resource, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-blue-400 mt-1">•</span>
                  {resource}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}