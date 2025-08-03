import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '../ui/button';
import { PDFLessonRenderer } from './PDFLessonRenderer';
import styles from './styles/pdf-styles.module.css';

// LessonView ContentBlock format (from API)
type LessonViewContentBlock = 
  | { type: 'heading'; content: string; metadata?: { level?: 1 | 2 | 3 | 4 | 5 | 6 }; order: number }
  | { type: 'paragraph'; content: string; order: number }
  | { type: 'code'; content: string; metadata?: { language?: string }; order: number }
  | { type: 'video'; content: any; order: number }
  | { type: 'quiz'; content: { question: string; options: string[]; correctAnswer: number; explanation?: string }; order: number }
  | { type: 'mcq'; content: { question: string; options: string[]; correctAnswer: number; explanation?: string }; order: number };

// PDF Renderer ContentBlock format 
type PDFContentBlock = 
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
  content: LessonViewContentBlock[];
  estimatedDuration?: string;
  courseId: string;
  courseName: string;
  moduleIndex: number;
  lessonIndex: number;
  totalModules: number;
  totalLessonsInModule: number;
  moduleTitle: string;
}

interface LessonPDFExporterProps {
  lesson: LessonData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const LessonPDFExporter: React.FC<LessonPDFExporterProps> = ({ 
  lesson,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  // Convert LessonView format to PDF Renderer format
  const convertToPDFFormat = (content: LessonViewContentBlock[]): PDFContentBlock[] => {
    console.log('Converting content for PDF:', content);
    return content.map((block, index) => {
      switch (block.type) {
        case 'heading':
          return {
            type: 'heading',
            content: block.content,
            metadata: { level: block.metadata?.level },
            order: block.order || index
          };
        case 'paragraph':
          return {
            type: 'paragraph',
            content: block.content,
            order: block.order || index
          };
        case 'code':
          return {
            type: 'code',
            content: block.content,
            metadata: { language: block.metadata?.language },
            order: block.order || index
          };
        case 'video':
          return {
            type: 'video',
            content: block.content,
            order: block.order || index
          };
        case 'quiz':
        case 'mcq':
          return {
            type: 'mcq',
            content: block.content,
            order: block.order || index
          };
        default:
          console.warn(`Unknown content block type: ${(block as any).type}`);
          return {
            type: 'paragraph',
            content: `Unknown content type: ${(block as any).type}`,
            order: index
          };
      }
    });
  };

  const generatePDF = async () => {
    if (!pdfContentRef.current) {
      setError('PDF content not ready. Please try again.');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(10);
      setError(null);

      // Show the hidden content temporarily for rendering
      const contentElement = pdfContentRef.current;
      const originalStyle = contentElement.style.cssText;
      
      // Make visible for capturing
      contentElement.style.position = 'absolute';
      contentElement.style.left = '0';
      contentElement.style.top = '0';
      contentElement.style.visibility = 'visible';
      contentElement.style.zIndex = '-1';

      setProgress(25);

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      setProgress(40);

      // Capture the content as canvas with high quality
      const canvas = await html2canvas(contentElement, {
        scale: 2, // High DPI for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: contentElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: contentElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure fonts are loaded in the cloned document
          const clonedElement = clonedDoc.getElementById('pdf-content');
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Times New Roman, serif';
          }
        }
      });

      setProgress(70);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate dimensions for A4 page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scale to fit width and maintain aspect ratio
      const scale = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * scale;
      
      if (scaledHeight <= pdfHeight) {
        // Content fits on single page
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight, undefined, 'FAST');
      } else {
        // Content needs multiple pages - use intelligent splitting
        const pageHeight = pdfHeight;
        let yPosition = 0;
        let pageNumber = 0;
        
        // Try to detect content blocks to avoid splitting them
        const blockElements = contentElement.querySelectorAll('[class*="pdfMcqBlock"], [class*="pdfCodeBlock"], [class*="pdfVideoBlock"]');
        const blockPositions: number[] = [];
        
        blockElements.forEach((block) => {
          (block as HTMLElement).getBoundingClientRect(); // ensure element is measured
          const elementTop = (block as HTMLElement).offsetTop;
          blockPositions.push(elementTop * scale);
        });
        
        while (yPosition < scaledHeight) {
          if (pageNumber > 0) {
            pdf.addPage();
          }
          
          let nextPageY = yPosition + pageHeight;
          
          // Check if we're about to split a content block
          for (const blockPos of blockPositions) {
            if (blockPos > yPosition && blockPos < nextPageY) {
              // There's a block starting in this page, make sure we don't cut it
              const blockHeight = 150; // Approximate block height in scaled units
              if (blockPos + blockHeight > nextPageY) {
                // Block would be cut, adjust the page break to before the block
                nextPageY = blockPos;
                break;
              }
            }
          }
          
          const actualHeight = Math.min(nextPageY - yPosition, scaledHeight - yPosition);
          
          // Create a temporary canvas for this page's content
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          
          if (pageCtx) {
            pageCanvas.width = imgWidth;
            pageCanvas.height = actualHeight / scale;
            
            // Draw the portion of the original canvas onto the page canvas
            pageCtx.drawImage(
              canvas,
              0, yPosition / scale, imgWidth, actualHeight / scale,  // Source rectangle
              0, 0, imgWidth, actualHeight / scale                   // Destination rectangle
            );
            
            // Add this page's image to the PDF
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
            pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, actualHeight, undefined, 'FAST');
          }
          
          yPosition = nextPageY;
          pageNumber++;
        }
      }

      setProgress(90);

      // Generate filename
      const sanitizeFilename = (name: string) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      };

      const filename = `${sanitizeFilename(lesson.courseName)}_module${lesson.moduleIndex + 1}_lesson${lesson.lessonIndex + 1}_${sanitizeFilename(lesson.title)}.pdf`;

      // Save the PDF
      pdf.save(filename);

      setProgress(100);

      // Hide the content again
      contentElement.style.cssText = originalStyle;

      // Reset progress after a short delay
      setTimeout(() => {
        setProgress(0);
        setIsGenerating(false);
      }, 1000);

    } catch (err) {
      console.error('PDF generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      setIsGenerating(false);
      setProgress(0);
      
      // Restore original styles in case of error
      if (pdfContentRef.current) {
        pdfContentRef.current.style.cssText = '';
      }
    }
  };

  const getButtonText = () => {
    if (isGenerating) {
      if (progress < 25) return 'Preparing...';
      if (progress < 50) return 'Rendering...';
      if (progress < 80) return 'Generating PDF...';
      return 'Finalizing...';
    }
    return 'Download PDF';
  };

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
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={generatePDF}
        disabled={isGenerating}
        className={className}
        title="Download lesson as PDF"
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>

      {isGenerating && progress > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 mb-1">
                Generating PDF... {progress}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-50">
          <div className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-xs text-red-600 hover:text-red-800 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hidden PDF content for rendering */}
      <div 
        ref={pdfContentRef}
        id="pdf-content"
        className={styles.pdfHidden}
        style={{ 
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          visibility: 'hidden'
        }}
      >
        <PDFLessonRenderer 
          lesson={{
            ...lesson,
            content: convertToPDFFormat(lesson.content)
          }} 
          includeHeader={true} 
        />
      </div>
    </div>
  );
};