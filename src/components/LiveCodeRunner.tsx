import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Terminal } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LiveCodeRunnerProps {
  code: string;
  language: string;
  onLanguageChange: (language: string) => void;
}

const supportedLanguages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'typescript', label: 'TypeScript' }
];

export default function LiveCodeRunner({ code, language, onLanguageChange }: LiveCodeRunnerProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    try {
      // This is a mock implementation. In a real app, you would connect to a backend service
      // that can execute code in different languages
      const mockOutput = `Running ${language} code...\n${code}\n\nOutput:\nMock output for demonstration`;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate execution delay
      setOutput(mockOutput);
      toast({
        title: "Code Executed",
        description: "Code ran successfully in the live runner",
      });
    } catch (error) {
      setOutput(`Error executing code: ${error}`);
      toast({
        title: "Execution Error",
        description: "Failed to run the code",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-4 bg-gray-800/50 backdrop-blur border-gray-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Live Code Runner
        </h3>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={runCode}
        disabled={isRunning || !code}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <Play className="w-4 h-4 mr-2" />
        {isRunning ? 'Running...' : 'Run Code'}
      </Button>

      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-[400px] overflow-auto">
        <pre className="text-gray-300 whitespace-pre-wrap">{output || 'Output will appear here...'}</pre>
      </div>
    </Card>
  );
}
