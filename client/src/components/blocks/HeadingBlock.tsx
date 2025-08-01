import React from 'react';

interface HeadingBlockData {
  type: 'heading';
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface HeadingBlockProps {
  block: HeadingBlockData;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block }) => {
  const { text, level = 2 } = block;
  
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const getHeadingStyles = (level: number) => {
    switch (level) {
      case 1:
        return 'text-4xl font-bold text-gray-900 mb-6';
      case 2:
        return 'text-3xl font-semibold text-gray-800 mb-5';
      case 3:
        return 'text-2xl font-semibold text-gray-800 mb-4';
      case 4:
        return 'text-xl font-medium text-gray-700 mb-3';
      case 5:
        return 'text-lg font-medium text-gray-700 mb-3';
      case 6:
        return 'text-base font-medium text-gray-600 mb-2';
      default:
        return 'text-2xl font-semibold text-gray-800 mb-4';
    }
  };

  return (
    <HeadingTag className={getHeadingStyles(level)}>
      {text}
    </HeadingTag>
  );
};