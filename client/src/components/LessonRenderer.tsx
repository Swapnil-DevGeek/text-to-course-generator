import React from 'react';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { MCQBlock } from './blocks/MCQBlock';

type ContentBlock = 
  | { type: 'heading'; text: string; level?: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; language: string; text: string }
  | { type: 'video'; url: string; title?: string; description?: string }
  | { type: 'mcq'; question: string; options: string[]; answer: number; explanation?: string };

interface LessonRendererProps {
  content: ContentBlock[];
}

export const LessonRenderer: React.FC<LessonRendererProps> = ({ content }) => {
  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return <HeadingBlock key={index} block={block} />;
      
      case 'paragraph':
        return <ParagraphBlock key={index} block={block} />;
      
      case 'code':
        return <CodeBlock key={index} block={block} />;
      
      case 'video':
        return <VideoBlock key={index} block={block} />;
      
      case 'mcq':
        return <MCQBlock key={index} block={block} />;
      
      default:
        console.warn(`Unknown block type: ${(block as any).type}`);
        return (
          <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-yellow-800">
              ⚠️ Unknown content block type: <code>{(block as any).type}</code>
            </p>
          </div>
        );
    }
  };

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
        <p className="text-gray-500">This lesson doesn't have any content blocks yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose prose-lg max-w-none">
        {content.map((block, index) => renderBlock(block, index))}
      </div>
    </div>
  );
};