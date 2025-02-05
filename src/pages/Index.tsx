import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CodeEditor from '@/components/CodeEditor';
import Timer from '@/components/Timer';
import { evaluateCode } from '@/services/gemini';
import { complexQuestions } from '@/services/questions';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Code2, Cpu } from "lucide-react";

export default function Index() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = complexQuestions[currentQuestionIndex];

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
      const evaluation = await evaluateCode(code, currentQuestion);
      
      if (!evaluation || typeof evaluation.score !== 'number') {
        throw new Error("Invalid evaluation result");
      }
      
      localStorage.setItem('evaluationResult', JSON.stringify(evaluation));
      localStorage.setItem('submittedCode', code);
      localStorage.setItem('problemDetails', JSON.stringify(currentQuestion));
      
      if (currentQuestionIndex < complexQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCode("");
        toast({
          title: "Question Completed!",
          description: "Moving to next question...",
        });
      } else {
        navigate('/results');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {currentQuestion.title}
            </h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-semibold">
                {currentQuestion.difficulty}
              </span>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <Timer duration={currentQuestion.timeLimit} onComplete={handleSubmit} />
              </div>
              <span className="text-gray-400">
                Question {currentQuestionIndex + 1} of {complexQuestions.length}
              </span>
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
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.description}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Constraints</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {currentQuestion.constraints.map((constraint, index) => (
                    <li key={index} className="text-red-400">{constraint}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Examples</h3>
                {currentQuestion.examples.map((example, index) => (
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

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-gray-300"
                onClick={() => setCode("")}
              >
                Reset
              </Button>
              <div className="flex gap-2">
                {currentQuestionIndex > 0 && (
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="bg-gray-700 hover:bg-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}
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
                    <>
                      {currentQuestionIndex < complexQuestions.length - 1 ? (
                        <>
                          Next Question
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        "Complete Test"
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}