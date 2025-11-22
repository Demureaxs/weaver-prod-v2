// components/WorldBuilder.tsx
import React, { useState } from 'react';
import { User, Book, Chapter, Character } from '../app/contexts/UserContext';
import { EditableBlock } from './EditableBlock';

interface WorldBuilderProps {
  user: User;
  onUpdate: (user: User) => void;
}

const WorldBuilder: React.FC<WorldBuilderProps> = ({ user, onUpdate }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(user.books?.[0] || null);
  const [selectedItem, setSelectedItem] = useState<Chapter | Character | null>(null);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setSelectedItem(null);
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedItem(chapter);
    const chapterElement = document.querySelector(`[data-chapter-id="${chapter.id}"]`);
    if (chapterElement) {
      chapterElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleValueChange = (index: number, newContent: string) => {
    // This is a placeholder for the actual update logic.
    // In a real application, you would update the state and persist the changes.
    console.log(`Updating item with content: ${newContent}`);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left Pane: Navigation */}
      <div className="w-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">My Worlds</h2>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Books</h3>
          <ul>
            {user.books?.map((book) => (
              <li
                key={book.id}
                className={`p-2 rounded cursor-pointer ${selectedBook?.id === book.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                onClick={() => handleBookSelect(book)}
              >
                {book.title}
              </li>
            ))}
          </ul>
        </div>
        {selectedBook && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-2">Chapters</h3>
              <ul>
                {selectedBook.chapters?.map((chapter) => (
                  <li
                    key={chapter.id}
                    className={`p-2 rounded cursor-pointer ${selectedItem?.id === chapter.id ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    onClick={() => handleChapterSelect(chapter)}
                  >
                    {chapter.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Characters</h3>
              <ul>
                {selectedBook.characters?.map((character) => (
                  <li
                    key={character.id}
                    className={`p-2 rounded cursor-pointer ${selectedItem?.id === character.id ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    onClick={() => setSelectedItem(character)}
                  >
                    {character.name}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Center Pane: Content */}
      <div className="w-1/2 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-inner p-6 overflow-y-auto h-full">
        {selectedBook && !('bio' in (selectedItem || {})) && (
          selectedBook.chapters?.map(chapter => (
            <div key={chapter.id} data-chapter-id={chapter.id} className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{chapter.title}</h2>
              <EditableBlock
                initialContent={chapter.content}
                onSave={handleValueChange}
                tag="p"
                index={0}
                isStreaming={false}
                currentApiKey=""
                onDeductCredit={() => true}
              />
            </div>
          ))
        )}
        {selectedItem && 'bio' in selectedItem && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
            <EditableBlock
              initialContent={selectedItem.bio}
              onSave={handleValueChange}
              tag="p"
              index={0}
              isStreaming={false}
              currentApiKey=""
              onDeductCredit={() => true}
            />
          </div>
        )}
      </div>

      {/* Right Pane: Parameter Editor */}
      <div className="w-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Editor</h2>
        {selectedItem ? (
          <div>
            <p>Editing options for {('title' in selectedItem) ? selectedItem.title : selectedItem.name}</p>
            {/* Add parameter editing UI here */}
          </div>
        ) : (
          <p>Select an item to edit its parameters.</p>
        )}
      </div>
    </div>
  );
};

export default WorldBuilder;
