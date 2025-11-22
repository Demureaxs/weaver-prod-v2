'use client';
import React from 'react';
import { EditableBlock } from './EditableBlock';

type SimpleMarkdownProps = {
  content: string;
  onContentChange: (content: string) => void;
  isStreaming: boolean;
  currentApiKey: string;
  onDeductCredit: (amount: number) => boolean;
};

export const SimpleMarkdown = ({ content, onContentChange, isStreaming = false, currentApiKey, onDeductCredit }: SimpleMarkdownProps) => {
  if (!content) return <div className='text-gray-400 italic'>No content generated yet...</div>;
  const lines = content.split('\n');
  const handleBlockSave = (index: number, newContent: string) => {
    const newLines = [...lines];
    newLines[index] = newContent;
    onContentChange(newLines.join('\n'));
  };
  return (
    <div className='space-y-2 text-left font-sans leading-relaxed text-gray-800 dark:text-gray-200'>
      {lines.map((line, index) => {
        let tag = 'p';
        if (line.startsWith('# ')) tag = 'h1';
        else if (line.startsWith('## ')) tag = 'h2';
        else if (line.startsWith('### ')) tag = 'h3';
        else if (line.startsWith('#### ')) tag = 'h4';
        else if (line.startsWith('- ') || line.startsWith('* ')) tag = 'li';
        else if (line.startsWith('![')) tag = 'img';
        else if (line.trim() === '') tag = 'spacer';
        return (
          <EditableBlock
            key={index}
            index={index}
            initialContent={line}
            tag={tag}
            onSave={handleBlockSave}
            isStreaming={isStreaming}
            currentApiKey={currentApiKey}
            onDeductCredit={onDeductCredit}
          />
        );
      })}
    </div>
  );
};
