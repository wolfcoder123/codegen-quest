
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Terminal } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from 'axios';

interface LiveCodeRunnerProps {
  code: string;
  language: string;
  onLanguageChange: (language: string) => void;
}

const supportedLanguages = [
  { value: 'python', label: 'Python', id: 71 },
  { value: 'javascript', label: 'JavaScript', id: 63 },
  { value: 'java', label: 'Java', id: 62 },
  { value: 'cpp', label: 'C++', id: 54 },
  { value: 'csharp', label: 'C#', id: 51 },
  { value: 'typescript', label: 'TypeScript', id: 74 }
];

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const RAPID_API_KEY = 'e770a4f2aamsh17408e1193bc728p123a90jsn37b53b431c94';

export default function LiveCodeRunner({ code, language, onLanguageChange }: LiveCodeRunnerProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [stdin, setStdin] = useState<string>('');

  const getLanguageId = (lang: string): number => {
    const language = supportedLanguages.find(l => l.value === lang);
    return language?.id || 63; // default to JavaScript if not found
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code to Run",
        description: "Please write some code before running.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput('Running code...');

    const options = {
      method: 'POST',
      url: `${JUDGE0_API}/submissions`,
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      data: {
        source_code: code,
        language_id: getLanguageId(language),
        stdin: stdin,
        expected_output: null,
        cpu_time_limit: 2,
        cpu_extra_time: 0.5,
        wall_time_limit: 5,
        memory_limit: 128000,
        stack_limit: 64000,
        enable_network: false
      }
    };

    try {
      const submission = await axios.request(options);
      const token = submission.data.token;

      // Poll for results
      let attempts = 10;
      const getResult = async () => {
        const result = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
          headers: {
            'X-RapidAPI-Key': RAPID_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        });

        if (result.data.status?.id <= 2 && attempts > 0) {
          attempts--;
          setTimeout(getResult, 1000);
        } else {
          let outputText = '';
          
          // Handle different types of output
          if (result.data.stdout) {
            outputText = result.data.stdout;
          } else if (result.data.stderr) {
            outputText = `Error: ${result.data.stderr}`;
          } else if (result.data.compile_output) {
            outputText = `Compilation Error: ${result.data.compile_output}`;
          } else if (result.data.message) {
            outputText = `Execution Error: ${result.data.message}`;
          } else {
            outputText = 'No output generated';
          }

          setOutput(outputText);

          if (result.data.status?.id === 3) {
            toast({
              title: "Code Executed",
              description: "Code ran successfully!",
            });
          } else {
            toast({
              title: "Execution Issue",
              description: result.data.status?.description || "There was an issue running the code",
              variant: "destructive",
            });
          }
          setIsRunning(false);
        }
      };

      await getResult();
    } catch (error) {
      console.error('Code execution error:', error);
      setOutput(`Error executing code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Execution Error",
        description: "Failed to run the code. Please try again.",
        variant: "destructive",
      });
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

      <textarea
        placeholder="Enter input for your program (optional)"
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
        className="w-full h-20 p-2 bg-gray-900 text-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />

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
