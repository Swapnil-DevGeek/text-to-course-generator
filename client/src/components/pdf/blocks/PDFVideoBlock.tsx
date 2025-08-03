import React from 'react';
import styles from '../styles/pdf-styles.module.css';

interface PDFVideoBlockData {
  type: 'video';
  url?: string;
  searchQuery?: string;
  title?: string;
  description?: string;
}

interface PDFVideoBlockProps {
  block: PDFVideoBlockData;
}

export const PDFVideoBlock: React.FC<PDFVideoBlockProps> = ({ block }) => {
  const { url, searchQuery, title, description } = block;

  // Generate a meaningful display based on available data
  const getVideoDisplay = () => {
    if (url) {
      return {
        title: title || 'Video Resource',
        subtitle: 'Direct Link',
        link: url,
        description: description
      };
    } else if (searchQuery) {
      return {
        title: title || 'Recommended Video',
        subtitle: 'Search Query',
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
        description: description || `Search for: "${searchQuery}"`
      };
    } else {
      return {
        title: title || 'Video Content',
        subtitle: 'Educational Video',
        link: null,
        description: description || 'Video content related to this lesson topic'
      };
    }
  };

  const videoInfo = getVideoDisplay();

  return (
    <div className={styles.pdfVideoBlock}>
      <div className={styles.pdfVideoTitle}>
        🎥 {videoInfo.title}
      </div>
      
      <div className={styles.pdfVideoContent}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          {videoInfo.subtitle}
        </div>
        
        {videoInfo.description && (
          <div className={styles.pdfVideoDescription}>
            {videoInfo.description}
          </div>
        )}
        
        {videoInfo.link && (
          <div style={{ marginTop: '10px' }}>
            <strong>Link:</strong>{' '}
            <span className={styles.pdfVideoLink}>
              {videoInfo.link}
            </span>
          </div>
        )}
        
        {searchQuery && !url && (
          <div style={{ marginTop: '10px', fontSize: '10pt', color: '#6c757d' }}>
            <em>Note: This video can be found by searching for "{searchQuery}" on YouTube or other video platforms.</em>
          </div>
        )}
      </div>
    </div>
  );
};