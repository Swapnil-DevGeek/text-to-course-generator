import React from 'react';
import { PDFHeadingBlock } from './blocks/PDFHeadingBlock';
import { PDFParagraphBlock } from './blocks/PDFParagraphBlock';
import { PDFCodeBlock } from './blocks/PDFCodeBlock';
import { PDFVideoBlock } from './blocks/PDFVideoBlock';
import { PDFMCQBlock } from './blocks/PDFMCQBlock';
import styles from './styles/pdf-styles.module.css';

type ContentBlock = 
  | { type: 'heading'; content: string; metadata?: { level?: 1 | 2 | 3 | 4 | 5 | 6 }; order: number }
  | { type: 'paragraph'; content: string; order: number }
  | { type: 'code'; content: string; metadata?: { language?: string }; order: number }
  | { type: 'video'; content: any; order: number }
  | { type: 'quiz'; content: { question: string; options: string[]; correctAnswer: number; explanation?: string }; order: number }
  | { type: 'mcq'; content: { question: string; options: string[]; correctAnswer: number; explanation?: string }; order: number };

interface LessonData {
  _id: string;
  title: string;
  description: string;
  content: ContentBlock[];
  estimatedDuration?: string;
  courseId: string;
  courseName: string;
  moduleIndex: number;
  lessonIndex: number;
  moduleTitle: string;
}

interface PDFLessonRendererProps {
  lesson: LessonData;
  includeHeader?: boolean;
}

export const PDFLessonRenderer: React.FC<PDFLessonRendererProps> = ({ 
  lesson, 
  includeHeader = true 
}) => {
  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <PDFHeadingBlock
            key={index}
            block={{
              type: 'heading',
              text: block.content || '',
              level: block.metadata?.level || 1
            }}
          />
        );
      
      case 'paragraph':
        return (
          <PDFParagraphBlock
            key={index}
            block={{
              type: 'paragraph',
              text: block.content || ''
            }}
          />
        );
      
      case 'code':
        return (
          <PDFCodeBlock
            key={index}
            block={{
              type: 'code',
              language: block.metadata?.language || 'text',
              text: block.content || ''
            }}
          />
        );
      
      case 'video':
        return (
          <PDFVideoBlock
            key={index}
            block={{
              type: 'video',
              url: block.content?.url,
              searchQuery: block.content?.searchQuery,
              title: block.content?.title,
              description: block.content?.description
            }}
          />
        );
      
      case 'quiz':
      case 'mcq':
        return (
          <PDFMCQBlock
            key={index}
            block={{
              type: 'mcq',
              question: block.content?.question || '',
              options: block.content?.options || [],
              answer: block.content?.correctAnswer || 0,
              explanation: block.content?.explanation
            }}
          />
        );
      
      default:
        console.warn(`Unknown block type: ${(block as any).type}`);
        return (
          <div key={index} className={styles.pdfParagraph}>
            <em>Unsupported content type: {(block as any).type}</em>
          </div>
        );
    }
  };

  // Sort content blocks by order
  const sortedContent = [...(lesson.content || [])].sort((a, b) => a.order - b.order);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return 'Duration not specified';
    return `Estimated Duration: ${duration}`;
  };

  return (
    <div className={styles.pdfContainer}>
      {includeHeader && (
        <div className={styles.pdfHeader}>
          <h1 className={styles.pdfTitle}>
            {lesson.title}
          </h1>
          <div className={styles.pdfSubtitle}>
            {lesson.courseName} • Module {lesson.moduleIndex + 1}: {lesson.moduleTitle} • Lesson {lesson.lessonIndex + 1}
          </div>
          <div className={styles.pdfMetadata}>
            {formatDuration(lesson.estimatedDuration)} • Generated on {formatDate()}
          </div>
          {lesson.description && (
            <div className={styles.pdfParagraph} style={{ marginTop: '15px', fontStyle: 'italic' }}>
              {lesson.description}
            </div>
          )}
        </div>
      )}

      <div className={styles.pdfContent}>
        {sortedContent.length > 0 ? (
          sortedContent.map((block, index) => renderBlock(block, index))
        ) : (
          <div className={styles.pdfParagraph}>
            <em>No content available for this lesson.</em>
          </div>
        )}
      </div>

      <div className={styles.pdfFooter}>
        <div>
          {lesson.courseName} - {lesson.title} | Page 1 | Generated with Text-to-Learn
        </div>
      </div>
    </div>
  );
};