import React from 'react';
import styles from '../styles/pdf-styles.module.css';

interface PDFHeadingBlockData {
  type: 'heading';
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface PDFHeadingBlockProps {
  block: PDFHeadingBlockData;
}

export const PDFHeadingBlock: React.FC<PDFHeadingBlockProps> = ({ block }) => {
  const { text, level = 1 } = block;
  
  const getHeadingClassName = (level: number) => {
    switch (level) {
      case 1:
        return styles.pdfHeading1;
      case 2:
        return styles.pdfHeading2;
      case 3:
        return styles.pdfHeading3;
      case 4:
        return styles.pdfHeading4;
      case 5:
        return styles.pdfHeading5;
      case 6:
        return styles.pdfHeading6;
      default:
        return styles.pdfHeading1;
    }
  };
  
  // Handle missing or invalid text
  if (!text || typeof text !== 'string') {
    return React.createElement('h2', {
      className: getHeadingClassName(2)
    }, 'Untitled Section');
  }

  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return React.createElement(HeadingTag, {
    className: getHeadingClassName(level)
  }, text);
};