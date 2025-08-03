import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { type ContentBlock } from '../../types/lesson';

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
  totalModules: number;
  totalLessonsInModule: number;
  moduleTitle: string;
}

interface ReactPDFLessonExporterProps {
  lesson: LessonData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #333333',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    fontFamily: 'Helvetica',
  },
  metadata: {
    fontSize: 10,
    color: '#64748b',
  },
  description: {
    fontSize: 12,
    marginTop: 10,
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  heading3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: 14,
    marginBottom: 7,
    fontFamily: 'Helvetica-Bold',
  },
  heading4: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  heading5: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 10,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  heading6: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  codeBlock: {
    backgroundColor: '#f8f9fa',
    border: '1pt solid #dee2e6',
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 12,
    breakInside: 'avoid',
  },
  codeHeader: {
    backgroundColor: '#e9ecef',
    borderBottom: '1pt solid #dee2e6',
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#495057',
    fontFamily: 'Helvetica-Bold',
  },
  codeContent: {
    padding: 12,
    fontFamily: 'Courier',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#212529',
  },
  mcqBlock: {
    backgroundColor: '#f8f9fa',
    border: '1pt solid #dee2e6',
    borderRadius: 4,
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    breakInside: 'avoid',
  },
  mcqTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  mcqQuestion: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  mcqOption: {
    marginBottom: 6,
    paddingLeft: 20,
    position: 'relative',
  },
  mcqOptionCorrect: {
    backgroundColor: '#d4edda',
    borderLeft: '4pt solid #28a745',
    padding: 6,
    marginBottom: 6,
    paddingLeft: 20,
  },
  mcqOptionLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  mcqAnswer: {
    backgroundColor: '#d4edda',
    borderLeft: '4pt solid #28a745',
    padding: 8,
    marginTop: 10,
  },
  mcqAnswerTitle: {
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 5,
  },
  mcqExplanation: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#e8f4f8',
    borderLeft: '4pt solid #2563eb',
  },
  mcqExplanationTitle: {
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  videoBlock: {
    backgroundColor: '#f8f9fa',
    border: '1pt solid #dee2e6',
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 12,
    padding: 15,
    breakInside: 'avoid',
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  videoContent: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  videoDescription: {
    color: '#6c757d',
    marginBottom: 5,
  },
  videoLink: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTop: '1pt solid #dee2e6',
    paddingTop: 8,
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
});

// PDF Document Component
const LessonPDFDocument: React.FC<{ lesson: LessonData }> = ({ lesson }) => {
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

  const getHeadingStyle = (level: number = 1) => {
    switch (level) {
      case 1: return styles.heading1;
      case 2: return styles.heading2;
      case 3: return styles.heading3;
      case 4: return styles.heading4;
      case 5: return styles.heading5;
      case 6: return styles.heading6;
      default: return styles.heading1;
    }
  };

  const getLanguageLabel = (lang: string = 'text') => {
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

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <Text key={index} style={getHeadingStyle(block.level)}>
            {block.text || 'Untitled Section'}
          </Text>
        );

      case 'paragraph':
        return (
          <Text key={index} style={styles.paragraph}>
            {block.text || ''}
          </Text>
        );

      case 'code':
        return (
          <View key={index} style={styles.codeBlock} wrap={false}>
            <View style={styles.codeHeader}>
              <Text>{getLanguageLabel(block.language)}</Text>
            </View>
            <View style={styles.codeContent}>
              <Text>{block.text || 'No code content available'}</Text>
            </View>
          </View>
        );

      case 'video': {
        const { url, title, description } = block;
        
        return (
          <View key={index} style={styles.videoBlock} wrap={false}>
            <Text style={styles.videoTitle}>
              {title || 'Video Content'}
            </Text>
            <View style={styles.videoContent}>
              {description && (
                <Text style={styles.videoDescription}>
                  {description}
                </Text>
              )}
              
              {/* Show direct URL if available */}
              {url && (
                <Text style={styles.videoLink}>
                  Watch Video: {url}
                </Text>
              )}
              
              {/* Show search query and links if no direct URL */}
              {/* Fallback when no URL */}
              {!url && (
                <Text style={styles.videoDescription}>
                  Video content related to this lesson topic
                </Text>
              )}
            </View>
          </View>
        );
      }

      case 'mcq': {
        const { question = '', options = [], answer = 0, explanation } = block;
        
        if (!question || options.length === 0) {
          return (
            <View key={index} style={styles.mcqBlock} wrap={false}>
              <Text style={styles.mcqTitle}>Multiple Choice Question</Text>
              <Text style={styles.mcqQuestion}>Invalid or missing question data</Text>
            </View>
          );
        }

        const validAnswer = answer >= 0 && answer < options.length ? answer : 0;

        return (
          <View key={index} style={styles.mcqBlock} wrap={false}>
            <Text style={styles.mcqTitle}>Multiple Choice Question</Text>
            
            <Text style={styles.mcqQuestion}>{question}</Text>

            <View>
              {options.map((option: string, index: number) => (
                <View key={index} style={index === validAnswer ? styles.mcqOptionCorrect : styles.mcqOption}>
                  <Text>
                    <Text style={styles.mcqOptionLabel}>
                      {String.fromCharCode(65 + index)}.
                    </Text>
                    {option}
                    {index === validAnswer && (
                      <Text style={{ color: '#28a745', fontWeight: 'bold' }}>
                        {' [CORRECT]'}
                      </Text>
                    )}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.mcqAnswer}>
              <Text style={styles.mcqAnswerTitle}>
                Correct Answer: {String.fromCharCode(65 + validAnswer)} - {options[validAnswer]}
              </Text>
            </View>

            {explanation && (
              <View style={styles.mcqExplanation}>
                <Text style={styles.mcqExplanationTitle}>Explanation:</Text>
                <Text>{explanation}</Text>
              </View>
            )}
          </View>
        );
      }

      default:
        return (
          <Text key={index} style={styles.paragraph}>
            Unknown content type: {(block as any).type}
          </Text>
        );
    }
  };

  // Sort content blocks by order
  const sortedContent = [...(lesson.content || [])];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.subtitle}>
            {lesson.courseName} | Module {lesson.moduleIndex + 1}: {lesson.moduleTitle} | Lesson {lesson.lessonIndex + 1}
          </Text>
          <Text style={styles.metadata}>
            {formatDuration(lesson.estimatedDuration)} | Generated on {formatDate()}
          </Text>
          {lesson.description && (
            <Text style={styles.description}>{lesson.description}</Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {sortedContent.length > 0 ? (
            sortedContent.map((block, index) => renderContentBlock(block, index))
          ) : (
            <Text style={styles.paragraph}>
              <Text>No content available for this lesson.</Text>
            </Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {lesson.courseName} - {lesson.title} | Generated with Course Craft
        </Text>
      </Page>
    </Document>
  );
};

export const ReactPDFLessonExporter: React.FC<ReactPDFLessonExporterProps> = ({ 
  lesson,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  };

  const filename = `${sanitizeFilename(lesson.courseName)}_module${lesson.moduleIndex + 1}_lesson${lesson.lessonIndex + 1}_${sanitizeFilename(lesson.title)}.pdf`;

  const getButtonIcon = () => {
    if (isGenerating) {
      return (
        <svg className="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
    );
  };

  return (
    <PDFDownloadLink
      document={<LessonPDFDocument lesson={lesson} />}
      fileName={filename}
      className={className}
    >
      {({ loading }) => (
        <Button
          variant={variant}
          size={size}
          disabled={loading}
          onClick={() => {
            setIsGenerating(true);
            setTimeout(() => setIsGenerating(false), 2000);
          }}
          className={className}
          title="Download lesson as PDF"
        >
          {getButtonIcon()}
          {loading || isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};