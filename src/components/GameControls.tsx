import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent, ChangeEvent } from 'react';
import { useGameStore } from '../store';
import { Timer } from 'lucide-react';
import { socket } from '../socket';

export const GameControls: React.FC = () => {
  const { 
    phase, 
    timeRemaining, 
    currentTurn, 
    addTag, 
    submitGuess, 
    images, 
    isMyTurn,
    getPlayerById 
  } = useGameStore();
  const [input, setInput] = useState<string>('');
  const [guessCount, setGuessCount] = useState<number>(1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if current user is admin
  const roomId = window.location.pathname.split('/').pop();
  const storedPlayerId = localStorage.getItem(`player-${roomId}`);
  const currentPlayer = storedPlayerId ? getPlayerById(storedPlayerId) : null;
  const isAdmin = currentPlayer?.isRoomAdmin ?? false;

  const handleSkipRound = () => {
    if (roomId) {
      console.log('Skipping to guessing phase...');
      socket.emit('phase-change', {
        roomId,
        phase: 'guessing',
        skipToPhase: true
      });
    }
  };

  const getInstructions = () => {
    if (phase === 'playing') {
      return "Add sentence descriptions to as many images as you can!";
    } else if (phase === 'guessing') {
      if (!isMyTurn()) {
        return `Waiting for ${currentTurn} team's codebreaker...`;
      }
      return (
        <span>
          Think of one word which matches as many{' '}
          <span className={currentTurn === 'green' ? 'text-green-500' : 'text-purple-500'}>
            {currentTurn} images
          </span>{' '}
          as possible.
        </span>
      );
    }
    return "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (phase === 'tagging') {
      const tags = input.trim().split(/\s+/);
      for (const tag of tags) {
        if (tag) {
          await addTag(tag);
        }
      }
    } else if (phase === 'guessing') {
      if (input.includes(' ')) {
        alert('Codebreakers can only submit single words!');
        return;
      }
      await submitGuess(input.trim(), guessCount);
    }
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        {phase === 'playing' && (
          <div className={`flex items-center ${timeRemaining <= 10 ? 'text-red-500' : 'text-white'}`}>
            <Timer className="mr-2" />
            {timeRemaining}s
          </div>
        )}
        <div className="text-white flex-grow text-center flex items-center justify-center gap-4">
          <span>{getInstructions()}</span>
          {phase === 'playing' && isAdmin && (
            <button
              onClick={handleSkipRound}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              Skip to Guessing
            </button>
          )}
        </div>
      </div>

      {/* Input controls */}
      {(phase === 'tagging' || (phase === 'guessing' && isMyTurn())) && (
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={phase === 'tagging' ? "Enter description..." : "Enter your guess word..."}
            className="flex-grow px-4 py-2 bg-gray-700 text-white rounded-lg"
            disabled={phase === 'guessing' && !isMyTurn()}
            autoFocus
          />
          
          {phase === 'guessing' && (
            <select
              value={guessCount}
              onChange={(e) => setGuessCount(Number(e.target.value))}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg"
            >
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>
                  Guess {num} {num === 1 ? 'image' : 'images'}
                </option>
              ))}
            </select>
          )}
        </form>
      )}
    </div>
  );
};