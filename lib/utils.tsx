import React from 'react';
import { ExternalLink } from 'lucide-react';

export const formatText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\)|(?<!\*)\*\*(?!\*).*?(?<!\*)\*\*(?!\*)|(?<!\*)\*(?!\*).*?(?<!\*)\*(?!\*)|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match && (match[2].startsWith('http://') || match[2].startsWith('https://'))) {
        return (
          <a
            key={index}
            href={match[2]}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-0.5'
            onClick={(e) => e.stopPropagation()}
          >
            {match[1]}
            <ExternalLink size={10} className='opacity-50' />
          </a>
        );
      }
    }
    if (part.startsWith('**') && part.endsWith('**'))
      return (
        <strong key={index} className='font-bold text-gray-900 dark:text-white'>
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith('*') && part.endsWith('*'))
      return (
        <em key={index} className='italic text-gray-800 dark:text-gray-100'>
          {part.slice(1, -1)}
        </em>
      );
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code key={index} className='bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400'>
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
};