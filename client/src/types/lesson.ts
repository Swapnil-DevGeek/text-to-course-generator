export interface BaseContentBlock {
  type: string;
}

export interface HeadingBlockData extends BaseContentBlock {
  type: 'heading';
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParagraphBlockData extends BaseContentBlock {
  type: 'paragraph';
  text: string;
}

export interface CodeBlockData extends BaseContentBlock {
  type: 'code';
  language: string;
  text: string;
}

export interface VideoBlockData extends BaseContentBlock {
  type: 'video';
  url: string;
  title?: string;
  description?: string;
  searchQuery?: string;
}

export interface MCQBlockData extends BaseContentBlock {
  type: 'mcq';
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export type ContentBlock = 
  | HeadingBlockData 
  | ParagraphBlockData 
  | CodeBlockData 
  | VideoBlockData 
  | MCQBlockData;

// Re-export types for easier imports
export type {
  HeadingBlockData as HeadingBlockType,
  ParagraphBlockData as ParagraphBlockType,
  CodeBlockData as CodeBlockType,
  VideoBlockData as VideoBlockType,
  MCQBlockData as MCQBlockType
};

export interface LessonContent {
  blocks: ContentBlock[];
}

export interface LessonRendererProps {
  content: ContentBlock[];
}