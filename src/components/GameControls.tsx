import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { Timer } from 'lucide-react';

export const GameControls: React.FC = () => {
  const { phase, timeRemaining, currentTurn, addTag, submitGuess, images } = useGameStore();
  const [input, setInput] = useState('');
  const [guessCount, setGuessCount] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasSelectedImages = images.some(img => img.selected);

  useEffect(() => {
    if (hasSelectedImages && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasSelectedImages, images.filter(img => img.selected).length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (phase === 'tagging') {
      addTag(input.trim());
    } else if (phase === 'guessing') {
      submitGuess(input.trim(), guessCount);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg h-[160px]">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            <span className="font-mono">{timeRemaining}s</span>
          </div>
          <div className="text-lg font-semibold">
            {currentTurn === 'green' ? "🟢" : "🟣"} Team's Turn
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\s/g, ''))}
            onKeyDown={handleKeyDown}
            placeholder={phase === 'tagging' ? "Enter tag..." : "Enter guess..."}
            className={`flex-1 px-4 py-2 border rounded-lg ${
              phase === 'tagging' && !hasSelectedImages ? 'opacity-50' : ''
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            disabled={phase === 'tagging' && !hasSelectedImages}
          />
          {phase === 'guessing' && (
            <input
              type="number"
              min="1"
              max="4"
              value={guessCount}
              onChange={(e) => setGuessCount(Number(e.target.value))}
              className="w-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
          <button
            type="submit"
            disabled={phase === 'tagging' && !hasSelectedImages}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors
              ${phase === 'tagging' && !hasSelectedImages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {phase === 'tagging' ? "Add Tag" : "Submit Guess"}
          </button>
        </form>
      </div>
    </div>
  );
};