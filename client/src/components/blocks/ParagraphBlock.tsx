import React from 'react';
import { type ParagraphBlockData } from '../../types/lesson';

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