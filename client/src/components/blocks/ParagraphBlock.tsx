import React from 'react';

interface ParagraphBlockData {
  type: 'paragraph';
  text: string;
}

interface ParagraphBlockProps {
  block: ParagraphBlockData;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ block }) => {
  const { text } = block;

  return (
    <p className="text-gray-700 leading-relaxed mb-4 text-base">
      {text}
    </p>
  );
};