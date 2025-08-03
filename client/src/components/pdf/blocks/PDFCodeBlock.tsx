import React from 'react';
import styles from '../styles/pdf-styles.module.css';

interface PDFCodeBlockData {
  type: 'code';
  language: string;
  text: string;
}

interface PDFCodeBlockProps {
  block: PDFCodeBlockData;
}

export const PDFCodeBlock: React.FC<PDFCodeBlockProps> = ({ block }) => {
  const { text, language } = block;
  
  // Handle missing or invalid data
  if (!text || typeof text !== 'string') {
    return (
      <div className={styles.pdfCodeBlock}>
        <div className={styles.pdfCodeHeader}>
          {language || 'Code'}
        </div>
        <div className={styles.pdfCodeContent}>
          <em>No code content available</em>
        </div>
      </div>
    );
  }
  
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
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      swift: 'Swift',
      kotlin: 'Kotlin',
      scala: 'Scala',
      r: 'R',
      matlab: 'MATLAB',
      text: 'Plain Text',
    };
    return languageMap[lang.toLowerCase()] || lang.toUpperCase();
  };

  // Process code text to ensure proper formatting
  const formatCode = (code: string) => {
    // Ensure consistent line endings and preserve indentation
    return code
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\t/g, '    '); // Convert tabs to spaces for consistent rendering
  };

  return (
    <div className={styles.pdfCodeBlock}>
      <div className={styles.pdfCodeHeader}>
        {getLanguageLabel(language)}
      </div>
      <div className={styles.pdfCodeContent}>
        {formatCode(text)}
      </div>
    </div>
  );
};