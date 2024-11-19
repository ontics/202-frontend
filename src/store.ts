import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { GameState, Team } from './types';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1',
  'https://images.unsplash.com/photo-1682686581498-5e85c7228119',
].map(url => `${url}?auto=format&fit=crop&w=400&h=300&q=80`);

// Fisher-Yates shuffle algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Add this near the top of the file
export const calculateSimilarity = async (word1: string, word2: string): Promise<number> => {
  try {
    console.log(`Calculating similarity between: ${word1} and ${word2}`);
    
    const response = await fetch('/api/calculate-similarity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        word1: word1.toLowerCase(),
        word2: word2.toLowerCase()
      })
    });

    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Similarity response:', data);
    return data.similarity || 0;
    
  } catch (error) {
    console.error('Error calculating similarity:', error);
    // More sophisticated fallback
    const w1 = word1.toLowerCase();
    const w2 = word2.toLowerCase();
    if (w1 === w2) return 1.0;
    if (w1.includes(w2) || w2.includes(w1)) return 0.8;
    // Check for plural forms
    if (w1.endsWith('s') && w1.slice(0, -1) === w2) return 0.9;
    if (w2.endsWith('s') && w2.slice(0, -1) === w1) return 0.9;
    return 0.0;
  }
};

// Helper function to format similarity as percentage
const formatSimilarity = (similarity: number): string => {
  // Convert to percentage and round to nearest integer
  const percentage = Math.round(similarity * 100);
  // Ensure it's between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  return `${clampedPercentage}%`;
};

// Add these helper functions at the top
const STORAGE_PREFIX = 'shadow-tag';

const saveRoomData = (roomId: string, data: Partial<GameState>) => {
  const currentData = loadRoomData(roomId) || {};
  const updatedData = { ...currentData, ...data };
  localStorage.setItem(`${STORAGE_PREFIX}-room-${roomId}`, JSON.stringify(updatedData));
};

const loadRoomData = (roomId: string): Partial<GameState> | null => {
  const data = localStorage.getItem(`${STORAGE_PREFIX}-room-${roomId}`);
  return data ? JSON.parse(data) : null;
};

interface GameStore extends GameState {
  initializeGame: (roomId: string) => void;
  addPlayer: (nickname: string, roomId: string) => Promise<string>;
  switchTeam: (playerId: string, newTeam: 'green' | 'purple') => void;
  setRole: (playerId: string, role: 'codebreaker' | 'tagger') => void;
  startGame: () => void;
  addTag: (tag: string) => void;
  removeTag: (imageId: string, tag: string) => void;
  selectImage: (imageId: string) => void;
  submitGuess: (word: string, count: number) => void;
  updateTimer: () => void;
  switchToGuessing: () => void;
  getPlayerById: (playerId: string) => any;
}

export const useGameStore = create<GameStore>((set, get) => ({
  roomId: '',
  phase: 'lobby',
  players: [],
  images: [],
  currentTurn: 'green',
  timeRemaining: 60,
  winner: null,

  initializeGame: async (roomId) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      if (!response.ok) throw new Error('Room not found');
      const room = await response.json();
      set(room);
      socket.emit('join-room', { roomId });
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  },

  addPlayer: async (nickname, roomId) => {
    const playerId = nanoid();
    const player = {
      id: playerId,
      nickname,
      team: 'green',
      role: 'tagger',
      isRoomAdmin: false,
      roomId,
    };

    socket.emit('join-room', { roomId, player });
    return playerId;
  },

  switchTeam: (playerId, newTeam) => {
    const state = get();
    const updatedState = {
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, team: newTeam } : p
      ),
    };
    
    set(updatedState);
    saveRoomData(state.roomId, updatedState);
  },

  setRole: (playerId, role) => {
    const state = get();
    const updatedState = {
      players: state.players.map(p =>
        p.id === playerId ? { ...p, role } : p
      ),
    };
    
    set(updatedState);
    saveRoomData(state.roomId, updatedState);
  },

  startGame: () => {
    const state = get();
    const updatedState = { 
      phase: 'tagging' as const, 
      timeRemaining: 60 
    };
    
    set(updatedState);
    saveRoomData(state.roomId, updatedState);

    const timer = setInterval(() => {
      get().updateTimer();
    }, 1000);

    return () => clearInterval(timer);
  },

  updateTimer: () => {
    const state = get();
    if (state.timeRemaining > 0) {
      const updatedState = { timeRemaining: state.timeRemaining - 1 };
      set(updatedState);
      saveRoomData(state.roomId, updatedState);
    } else if (state.phase === 'tagging') {
      get().switchToGuessing();
    }
  },

  switchToGuessing: () => {
    const state = get();
    const updatedState = { 
      phase: 'guessing' as const,
      timeRemaining: 60,
      images: state.images.map(img => ({ ...img, selected: false }))
    };
    
    set(updatedState);
    saveRoomData(state.roomId, updatedState);
  },

  addTag: (tag) => {
    if (!tag.trim()) return;
    
    const state = get();
    const selectedImages = state.images.filter(img => img.selected);
    const shouldKeepSelected = selectedImages.length === 1;
    
    set(state => ({
      images: state.images.map(img =>
        img.selected && !img.tags.includes(tag)
          ? { ...img, tags: [...img.tags, tag], selected: shouldKeepSelected }
          : img.selected && !shouldKeepSelected
          ? { ...img, selected: false }
          : img
      ),
    }));
  },

  removeTag: (imageId, tag) => {
    set(state => ({
      images: state.images.map(img =>
        img.id === imageId
          ? { ...img, tags: img.tags.filter(t => t !== tag) }
          : img
      ),
    }));
  },

  selectImage: (imageId) => {
    set(state => ({
      images: state.images.map(img =>
        img.id === imageId
          ? { ...img, selected: !img.selected }
          : img
      ),
    }));
  },

  submitGuess: async (word: string, count: number) => {
    const state = get();
    const currentTeam = state.currentTurn;
    
    // Calculate similarities for all unmatched images
    const similarities = await Promise.all(
      state.images
        .filter(img => !img.matched)
        .map(async (img) => {
          const tagSimilarities = await Promise.all(
            img.tags.map(async tag => ({
              tag,
              similarity: await calculateSimilarity(word, tag)
            }))
          );
          const bestMatch = tagSimilarities.reduce((best, current) => 
            current.similarity > best.similarity ? current : best
          );
          console.log(`Guess: "${word}", Match: "${bestMatch.tag}", Similarity: ${formatSimilarity(bestMatch.similarity)}`);
          return { 
            ...img, 
            matchedTag: bestMatch.tag, 
            similarity: bestMatch.similarity,
            formattedSimilarity: formatSimilarity(bestMatch.similarity)
          };
        })
    );

    // Sort by similarity and get top matches
    const sortedSimilarities = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count);

    // Check if first match is opponent's or red
    const firstMatch = sortedSimilarities[0];
    const hitOpponent = firstMatch && (
      firstMatch.team === 'red' || 
      firstMatch.team !== currentTeam
    );

    // Update matched state
    const matchesToApply = hitOpponent ? 1 : count;
    const matchedImages = sortedSimilarities.slice(0, matchesToApply);

    set(state => ({
      images: state.images.map(img => {
        const match = matchedImages.find(m => m.id === img.id);
        if (match) {
          return {
            ...img,
            matched: true,
            matchedWord: word,
            matchedTag: match.matchedTag,
            similarity: match.similarity,
            formattedSimilarity: formatSimilarity(match.similarity)
          };
        }
        return img;
      }),
      currentTurn: currentTeam === 'green' ? 'purple' : 'green',
      phase: 'guessing',  // Ensure we stay in guessing phase
      timeRemaining: state.timeRemaining  // Maintain the current time
    }));

    // Check win condition and calculate stats
    const updatedState = get();
    const calculateTeamStats = (team: Team) => {
      const teamImages = updatedState.images.filter(img => img.team === team && img.matched);
      const matchCount = teamImages.length;
      const avgSimilarity = teamImages.reduce((sum, img) => sum + img.similarity, 0) / matchCount || 0;
      return { matchCount, avgSimilarity };
    };

    const greenStats = calculateTeamStats('green');
    const purpleStats = calculateTeamStats('purple');

    // Determine winner based on matches and average similarity
    let winner: Team | null = null;
    if (greenStats.matchCount !== purpleStats.matchCount) {
      winner = greenStats.matchCount > purpleStats.matchCount ? 'green' : 'purple';
    } else if (greenStats.avgSimilarity !== purpleStats.avgSimilarity) {
      winner = greenStats.avgSimilarity > purpleStats.avgSimilarity ? 'green' : 'purple';
    }

    if (updatedState.timeRemaining <= 0) {
      set({ 
        phase: 'gameOver',
        winner,
        gameStats: {
          green: {
            matches: greenStats.matchCount,
            avgSimilarity: formatSimilarity(greenStats.avgSimilarity)
          },
          purple: {
            matches: purpleStats.matchCount,
            avgSimilarity: formatSimilarity(purpleStats.avgSimilarity)
          }
        }
      });
    }
  },

  getPlayerById: (playerId: string) => {
    const state = get();
    return state.players.find(p => p.id === playerId);
  },
}));

// Listen for room updates
socket.on('room-updated', (room: GameState) => {
  useGameStore.setState(room);
});