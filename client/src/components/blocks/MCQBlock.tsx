import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface MCQBlockData {
  type: 'mcq';
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

interface MCQBlockProps {
  block: MCQBlockData;
}

export const MCQBlock: React.FC<MCQBlockProps> = ({ block }) => {
  const { question, options, answer, explanation } = block;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setShowResult(true);
    setHasAnswered(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowResult(false);
    setHasAnswered(false);
  };

  const getOptionClassName = (optionIndex: number) => {
    let baseClasses = "p-3 border rounded-lg cursor-pointer transition-all duration-200 text-left";
    
    if (!hasAnswered) {
      if (selectedOption === optionIndex) {
        return `${baseClasses} border-blue-500 bg-blue-50`;
      }
      return `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
    }
    
    if (optionIndex === answer) {
      return `${baseClasses} border-green-500 bg-green-50 text-green-800`;
    }
    
    if (selectedOption === optionIndex && optionIndex !== answer) {
      return `${baseClasses} border-red-500 bg-red-50 text-red-800`;
    }
    
    return `${baseClasses} border-gray-200 bg-gray-50 text-gray-600`;
  };

  const getResultMessage = () => {
    if (selectedOption === answer) {
      return "Correct! Well done.";
    }
    return "Incorrect. Try again or see the explanation below.";
  };

  const getResultClassName = () => {
    if (selectedOption === answer) {
      return "text-green-800 bg-green-50 border-green-200";
    }
    return "text-red-800 bg-red-50 border-red-200";
  };

  return (
    <Card className="p-6 mb-6 bg-white border border-gray-200">
      <div className="mb-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          📝 Question
        </h4>
        <p className="text-base text-gray-700 leading-relaxed">
          {question}
        </p>
      </div>

      <div className="space-y-3 mb-4">
        {options.map((option, index) => (
          <div
            key={index}
            className={getOptionClassName(index)}
            onClick={() => handleOptionSelect(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOptionSelect(index);
              }
            }}
          >
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
              {hasAnswered && index === answer && (
                <span className="flex-shrink-0 text-green-600">✓</span>
              )}
              {hasAnswered && selectedOption === index && index !== answer && (
                <span className="flex-shrink-0 text-red-600">✗</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!hasAnswered ? (
        <Button 
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className="w-full"
        >
          Submit Answer
        </Button>
      ) : (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg border ${getResultClassName()}`}>
            <p className="font-medium">{getResultMessage()}</p>
          </div>
          
          {explanation && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
              <p className="text-blue-800 text-sm">{explanation}</p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
};