import React, { useState } from 'react';
import { Button } from '../ui/button';
import { type CodeBlockData } from '../../types/lesson';

interface CodeBlockProps {
  block: CodeBlockData;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ block }) => {
  const { text, language } = block;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getLanguageLabel = (lang: string) => {
    const languageMap: Record<string, string> = {
      js: 'JavaScript',
      ts: 'TypeScript',
      jsx: 'JSX',
      tsx: 'TSX',
      py: 'Python',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      css: 'CSS',
      html: 'HTML',
      sql: 'SQL',
      bash: 'Bash',
      sh: 'Shell',
      json: 'JSON',
      xml: 'XML',
      yaml: 'YAML',
      yml: 'YAML',
      md: 'Markdown',
      markdown: 'Markdown',
    };
    return languageMap[lang.toLowerCase()] || lang.toUpperCase();
  };

  return (
    <div className="relative mb-6 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-600">
          {getLanguageLabel(language)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-xs"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-800 whitespace-pre">
          {text}
        </code>
      </pre>
    </div>
  );
};