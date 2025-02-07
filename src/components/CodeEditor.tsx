
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
}

const languageMap = {
  'python': 'python',
  'javascript': 'javascript',
  'java': 'java',
  'cpp': 'cpp',
  'csharp': 'csharp',
  'typescript': 'typescript'
};

export default function CodeEditor({
  value,
  onChange,
  language = "javascript",
  className = "",
}: CodeEditorProps) {
  const editorLanguage = languageMap[language as keyof typeof languageMap] || 'javascript';

  return (
    <div className={className}>
      <Editor
        height="100%"
        defaultLanguage={editorLanguage}
        language={editorLanguage}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
