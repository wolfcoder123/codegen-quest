import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CodeEditor from '@/components/CodeEditor';
import Timer from '@/components/Timer';
import { evaluateCode } from '@/services/gemini';
import { CodeProblem, EvaluationResult } from '@/types/code';
import { toast } from "@/components/ui/use-toast";

const sampleProblem: CodeProblem = {
  id: "1",
  title: "Two Sum",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  difficulty: "Medium",
  timeLimit: 3600,
  testCases: [
    {
      input: "[2,7,11,15], target = 9",
      expectedOutput: "[0,1]"
    }
  ],
  constraints: [
    "2 <= nums.length <= 104",
    "-109 <= nums[i] <= 109",
    "-109 <= target <= 109"
  ],
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ]
};

export default function Index() {
  const [code, setCode] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleSubmit = async () => {
    try {
      setIsEvaluating(true);
      const evaluation = await evaluateCode(code, sampleProblem);
      setResult(evaluation);
      toast({
        title: "Evaluation Complete",
        description: `Score: ${evaluation.score}%`,
      });
    } catch (error) {
      toast({
        title: "Evaluation Failed",
        description: "An error occurred while evaluating your code.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">{sampleProblem.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm">
                {sampleProblem.difficulty}
              </span>
              <Timer duration={sampleProblem.timeLimit} onComplete={handleSubmit} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h2 className="text-xl font-semibold mb-4">Problem Description</h2>
            <p className="text-muted-foreground mb-6">{sampleProblem.description}</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Constraints:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {sampleProblem.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Examples:</h3>
                {sampleProblem.examples.map((example, index) => (
                  <div key={index} className="bg-code-background rounded-lg p-4 text-sm">
                    <div>Input: {example.input}</div>
                    <div>Output: {example.output}</div>
                    <div className="text-muted-foreground mt-2">{example.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <CodeEditor
              value={code}
              onChange={setCode}
              language="javascript"
              className="h-[600px] rounded-lg overflow-hidden border border-border/50"
            />
            
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isEvaluating}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                {isEvaluating ? "Evaluating..." : "Submit Solution"}
              </Button>
            </div>

            {result && (
              <Card className="p-6 bg-card/50 backdrop-blur animate-slideUp">
                <h3 className="text-xl font-semibold mb-4">Evaluation Results</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Score:</span>
                    <span className="text-2xl font-bold text-cyan-400">{result.score}%</span>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.feedback}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}