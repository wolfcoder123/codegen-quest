
import { TechStackAnalysis } from "@/types/code";
import { Card } from "@/components/ui/card";
import { Code2, Server, Database, Wrench } from "lucide-react";

interface TechStackCardProps {
  techStack: TechStackAnalysis;
}

export default function TechStackCard({ techStack }: TechStackCardProps) {
  return (
    <Card className="p-6 bg-gray-800/30 backdrop-blur border-gray-700/50 shadow-xl">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Code2 className="w-6 h-6 text-cyan-400" />
        Technology Stack Analysis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2 mb-3">
              <Code2 className="w-5 h-5" />
              Frontend Technologies
            </h3>
            <div className="bg-gray-900/30 p-4 rounded-lg">
              {techStack.frontend.map((tech, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm mr-2 mb-2">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2 mb-3">
              <Server className="w-5 h-5" />
              Backend Technologies
            </h3>
            <div className="bg-gray-900/30 p-4 rounded-lg">
              {techStack.backend.map((tech, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm mr-2 mb-2">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2 mb-3">
              <Database className="w-5 h-5" />
              Databases
            </h3>
            <div className="bg-gray-900/30 p-4 rounded-lg">
              {techStack.databases.map((db, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm mr-2 mb-2">
                  {db}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5" />
              Tools & Infrastructure
            </h3>
            <div className="bg-gray-900/30 p-4 rounded-lg">
              {techStack.tools.map((tool, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm mr-2 mb-2">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-3">
          <Code2 className="w-5 h-5" />
          Code Highlights
        </h3>
        <div className="space-y-4">
          {techStack.codeHighlights.map((highlight, index) => (
            <div key={index} className="bg-gray-900/30 p-4 rounded-lg">
              <p className="text-gray-300 mb-2">{highlight.description}</p>
              <pre className="bg-black/50 p-3 rounded overflow-x-auto">
                <code className="text-sm text-cyan-300">
                  {highlight.code}
                </code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
