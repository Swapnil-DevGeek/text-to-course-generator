import React from 'react';
import styles from '../styles/pdf-styles.module.css';

interface PDFMCQBlockData {
  type: 'mcq';
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

interface PDFMCQBlockProps {
  block: PDFMCQBlockData;
}

export const PDFMCQBlock: React.FC<PDFMCQBlockProps> = ({ block }) => {
  const { question, options, answer, explanation } = block;

  // Handle missing or invalid data
  if (!question || !options || !Array.isArray(options) || options.length === 0 || typeof answer !== 'number') {
    return (
      <div className={styles.pdfMcqBlock}>
        <div className={styles.pdfMcqTitle}>
          📝 Multiple Choice Question
        </div>
        <div className={styles.pdfMcqQuestion}>
          <em>Invalid or missing question data</em>
        </div>
      </div>
    );
  }

  // Ensure answer index is valid
  const validAnswer = answer >= 0 && answer < options.length ? answer : 0;

  return (
    <div className={styles.pdfMcqBlock}>
      <div className={styles.pdfMcqTitle}>
        📝 Multiple Choice Question
      </div>
      
      <div className={styles.pdfMcqQuestion}>
        {question}
      </div>

      <div className={styles.pdfMcqOptions}>
        {options.map((option, index) => (
          <div
            key={index}
            className={index === validAnswer ? styles.pdfMcqOptionCorrect : styles.pdfMcqOption}
          >
            <span className={styles.pdfMcqOptionLabel}>
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
            {index === validAnswer && (
              <span style={{ marginLeft: '10px', color: '#28a745', fontWeight: 'bold' }}>
                ✓ Correct Answer
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.pdfMcqAnswer}>
        <div className={styles.pdfMcqAnswerTitle}>
          Correct Answer: {String.fromCharCode(65 + validAnswer)} - {options[validAnswer]}
        </div>
      </div>

      {explanation && (
        <div className={styles.pdfMcqExplanation}>
          <div className={styles.pdfMcqExplanationTitle}>
            Explanation:
          </div>
          <div>{explanation}</div>
        </div>
      )}
    </div>
  );
};