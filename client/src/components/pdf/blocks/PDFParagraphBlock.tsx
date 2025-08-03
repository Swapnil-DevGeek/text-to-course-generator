import React from 'react';
import styles from '../styles/pdf-styles.module.css';

interface PDFParagraphBlockData {
  type: 'paragraph';
  text: string;
}

interface PDFParagraphBlockProps {
  block: PDFParagraphBlockData;
}

export const PDFParagraphBlock: React.FC<PDFParagraphBlockProps> = ({ block }) => {
  const { text } = block;
  
  // Handle missing or invalid text
  if (!text || typeof text !== 'string') {
    return (
      <p className={styles.pdfParagraph}>
        <em>No content available</em>
      </p>
    );
  }
  
  // Handle text formatting - convert basic markdown-like formatting
  const formatText = (text: string) => {
    // Split by newlines and create proper paragraph breaks
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      // Handle bold text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      return (
        <span 
          key={index}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  // If text contains multiple paragraphs (double newlines), split them
  const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
  
  if (paragraphs.length > 1) {
    return (
      <>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={styles.pdfParagraph}>
            {formatText(paragraph)}
          </p>
        ))}
      </>
    );
  }

  return (
    <p className={styles.pdfParagraph}>
      {formatText(text)}
    </p>
  );
};