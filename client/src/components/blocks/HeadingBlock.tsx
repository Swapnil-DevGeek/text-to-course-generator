import React from 'react';
import { type HeadingBlockData } from '../../types/lesson';

interface HeadingBlockProps {
  block: HeadingBlockData;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block }) => {
  const { text, level = 2 } = block;
  
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

  const headingProps = {
    className: getHeadingStyles(level),
    children: text
  };

  switch (level) {
    case 1:
      return <h1 {...headingProps} />;
    case 2:
      return <h2 {...headingProps} />;
    case 3:
      return <h3 {...headingProps} />;
    case 4:
      return <h4 {...headingProps} />;
    case 5:
      return <h5 {...headingProps} />;
    case 6:
      return <h6 {...headingProps} />;
    default:
      return <h2 {...headingProps} />;
  }
};