import React, { useState, useEffect } from 'react';
import type { GameImage as GameImageType, GamePhase } from '../types';
import { useGameStore } from '../store';

interface GameImageProps {
  image: GameImageType;
  onClick?: () => void;
  showTeam?: boolean;
  phase: GamePhase;
  index: number;
  isGuessing?: boolean;
}

export const GameImage: React.FC<GameImageProps> = ({ 
  image, 
  onClick, 
  showTeam, 
  phase, 
  index,
  isGuessing 
}) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Calculate ripple delay based on distance from center bottom
  const getRippleDelay = () => {
    const row = Math.floor(index / 5);  // 0-2
    const col = index % 5;              // 0-4
    const centerCol = 2;
    const bottomRow = 2;
    
    const colDist = Math.abs(col - centerCol);
    const rowDist = Math.abs(row - bottomRow);
    const distance = Math.sqrt(colDist * colDist + rowDist * rowDist);
    
    // Adjust this value to change how quickly the ripple spreads (lower = faster)
    return distance * 200;
  };

  // Listen for guess submissions to trigger buffering
  useEffect(() => {
    if (phase === 'guessing' && isGuessing && !image.matched) {
      console.log('Starting buffer animation for image:', image.id);
      const startDelay = getRippleDelay();
      
      // Start buffering after the calculated ripple delay
      const timer = setTimeout(() => {
        setIsBuffering(true);
      }, startDelay);

      return () => {
        clearTimeout(timer);
        setIsBuffering(false);
      };
    } else if (image.matched || !isGuessing) {
      // Stop buffering immediately when image is matched or guessing ends
      setIsBuffering(false);
    }
  }, [phase, isGuessing, image.matched, index, image.id]);

  // Handle match reveal animation
  useEffect(() => {
    if (image.matched && phase === 'guessing') {
      setIsRevealing(true);
      // Adjust this value (3000) to change how long the reveal animation lasts
      const timer = setTimeout(() => {
        setIsRevealing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return () => setIsRevealing(false);
  }, [image.matched, phase]);

  // Clean up animation states when phase changes
  useEffect(() => {
    setIsRevealing(false);
    setIsBuffering(false);
  }, [phase]);

  const getBorderColor = () => {
    if ((phase === 'guessing' || phase === 'gameOver') && showTeam) {
      if (image.team === 'green') return 'ring-2 ring-green-500';
      if (image.team === 'purple') return 'ring-2 ring-purple-500';
      if (image.team === 'red') return 'ring-2 ring-red-500';
    }
    return '';
  };

  const getTeamColors = () => {
    if (image.team === 'green') {
      return {
        bright: '220, 252, 231', // green-100
        light: '134, 239, 172',  // green-300
        base: '34, 197, 94',     // green-500
      };
    }
    if (image.team === 'purple') {
      return {
        bright: '243, 232, 255', // purple-100
        light: '216, 180, 254',  // purple-300
        base: '168, 85, 247',    // purple-500
      };
    }
    if (image.team === 'red') {
      return {
        bright: '254, 226, 226', // red-100
        light: '252, 165, 165',  // red-300
        base: '239, 68, 68',     // red-500
      };
    }
    return {
      bright: '255, 255, 255',
      light: '255, 255, 255',
      base: '255, 255, 255',
    };
  };

  const colors = getTeamColors();

  return (
    <div className="p-2">
      <div 
        className={`
          relative aspect-video rounded-lg overflow-visible
          group isolate
          transition-transform duration-300 ease-out transform-gpu
          hover:!scale-105 hover:z-10
          ${isBuffering ? 'animate-buffer z-10' : ''}
          ${isRevealing ? 'animate-reveal z-10' : ''}
          ${showTeam ? getBorderColor() : ''}
        `}
        onClick={onClick}
        style={{
          '--team-color-bright': colors.bright,
          '--team-color-light': colors.light,
          '--team-color-base': colors.base,
          animationDelay: `${getRippleDelay()}ms`,
          transform: isBuffering ? 'var(--buffer-scale)' : 
                    isRevealing ? 'var(--reveal-scale)' : 
                    'scale(1)',
        } as React.CSSProperties}
      >
        {/* Outer glow effect */}
        <div 
          className={`
            absolute inset-[-20px] -z-10
            transition-opacity duration-300
            ${isBuffering ? 'animate-buffer-glow' : ''}
          `}
          style={{
            background: `
              radial-gradient(100% 100% at 50% 50%,
                rgb(var(--team-color-bright)) 30%,
                rgb(var(--team-color-light)) 40%,
                rgb(var(--team-color-base)) 50%,
                transparent 80%
              )
            `,
            filter: 'blur(12px)',
            opacity: isBuffering ? '0' : // Start at 0 to ensure consistent initial state
                    isRevealing ? 'var(--reveal-glow, 0)' : 
                    phase === 'guessing' ? 'var(--hover-glow, 0)' : '0',
            animationDelay: `${getRippleDelay()}ms`,
          }}
        />

        {/* Inner glow effect for matched cards */}
        {image.matched && (
          <div 
            className={`
              absolute inset-0 z-30 rounded-lg
              transition-all duration-300
              pointer-events-none
              ${!isRevealing ? 'opacity-100' : 'opacity-0'}
              group-hover:opacity-0
            `}
            style={{
              background: `
                radial-gradient(circle at center, 
                  transparent 30%, 
                  rgb(var(--team-color-base)) 100%
                )
              `,
              filter: 'blur(8px)',
            }}
          />
        )}

        {/* Image container */}
        <div 
          className={`
            relative w-full h-full rounded-lg overflow-hidden
            ${(image.matched && !isRevealing) || (phase === 'playing' && image.tags.length > 0) ? 'opacity-75 brightness-110' : ''}
          `}
        >
          <img 
            src={image.url} 
            alt="" 
            className="w-full h-full object-cover"
          />

          {/* Description overlay for playing phase */}
          {phase === 'playing' && (() => {
            const storedPlayerId = localStorage.getItem(`player-${window.location.pathname.split('/').pop()}`);
            const playerTag = image.tags.find(tag => tag.playerId === storedPlayerId);
            
            // Only show overlay if current player has added a description
            if (!playerTag) return null;
            
            return (
              <div className="absolute inset-0 bg-black/60 p-3 text-white">
                <div className="text-sm line-clamp-4">
                  {playerTag.text}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  by {playerTag.playerNickname}
                </div>
              </div>
            );
          })()}

          {/* Description overlay for non-playing phases */}
          {phase !== 'playing' && phase !== 'guessing' && image.tags.length > 0 && (
            <div className="absolute inset-0 bg-black/60 p-3 text-white">
              <div className="text-sm line-clamp-4">
                {image.tags[image.tags.length - 1].text}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                by {image.tags[image.tags.length - 1].playerNickname}
              </div>
            </div>
          )}

        {/* /* Match details overlay for guessing phase
          {phase === 'guessing' && image.matched && (
            <div className="absolute inset-0 bg-black/60 p-3 text-white">
              <div className="text-sm line-clamp-4">
                {image.matchedWord}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Match Score: {Math.round((image.similarity || 0) * 100)}%
              </div>
            </div>
          )} */}
        </div>

        {/* Match info overlay */}
        {showTeam && image.matched && (
          <div className={`
            absolute inset-0 z-20 rounded-lg
            bg-black/40
            flex flex-col items-center justify-center gap-2
            ${isRevealing ? 'animate-fade-in' : ''}
          `}>
            <span className="text-white text-lg font-bold">
              {image.matchedWord}
            </span>
            <span className={`text-sm ${
              image.similarity > 0.7 ? 'text-green-400' : 
              image.similarity > 0.5 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              ({Math.round(image.similarity * 100)}%)
            </span>
          </div>
        )}
      </div>

      <style>{`
        .group:hover {
          --hover-glow: 1;
        }
        .animate-buffer {
          --buffer-scale: scale(1.075);
          animation: pulse 2s cubic-bezier(0.2, 0, 0, 1) infinite;
        }
        .animate-buffer-glow {
          animation: glow 2s cubic-bezier(0.2, 0, 0, 1) infinite;
        }
        .animate-reveal {
          --reveal-scale: scale(1.15);
          --reveal-glow: 1;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          30% {
            transform: var(--buffer-scale);
          }
        }
        @keyframes glow {
          0%, 100% {
            opacity: 0;
          }
          30% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};