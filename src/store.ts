import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { GameState, Team } from './types';
import { socket } from './socket';

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Add socket event listeners for room updates
socket.on('game-state', (gameState: GameState) => {
  console.log('Received game state:', gameState);
  useGameStore.getState().initializeGame(gameState);
});

socket.on('room-updated', (gameState: GameState) => {
  console.log('Room updated:', gameState);
  useGameStore.getState().initializeGame(gameState);
});

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
    
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        word: word1.toLowerCase(),
        description: word2.toLowerCase(),
        model: 'sbert'
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
  initializeGame: (gameState: GameState) => void;
  addPlayer: (nickname: string, roomId: string) => Promise<string>;
  switchTeam: (playerId: string, newTeam: Team) => void;
  setRole: (playerId: string, role: 'codebreaker' | 'tagger') => void;
  startGame: () => void;
  addTag: (imageId: string, tag: string, playerNickname: string) => void;
  removeTag: (imageId: string, tag: string) => void;
  selectImage: (imageId: string) => void;
  submitGuess: (word: string, count: number) => void;
  updateTimer: () => void;
  switchToGuessing: () => void;
  getPlayerById: (playerId: string) => any;
  setPhase: (phase: GamePhase) => void;
  startTimer: () => () => void;
  isMyTurn: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  roomId: '',
  phase: 'lobby',
  players: [],
  images: [],
  currentTurn: 'green',
  timeRemaining: 60,
  winner: null,

  initializeGame: (gameState: GameState) => {
    console.log('Initializing game with state:', gameState);
    set(state => ({
      ...state,
      ...gameState,
      phase: gameState.phase || 'playing',
      roomId: gameState.id || gameState.roomId,
      players: gameState.players || [],
      images: gameState.images || [],
      currentTurn: gameState.currentTurn || 'green',
      timeRemaining: gameState.timeRemaining !== undefined ? gameState.timeRemaining : state.timeRemaining
    }));
  },

  setPhase: (phase: GamePhase) => set({ phase }),

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

  switchTeam: (playerId: string, newTeam: Team) => {
    const state = get();
    console.log(`Attempting to switch player ${playerId} to team ${newTeam}`);
    console.log('Current room state:', state);
    
    if (!state.roomId) {
      console.error('No roomId found in state');
      return;
    }
    
    socket.emit('switch-team', {
      roomId: state.roomId,
      playerId,
      newTeam
    });
    
    console.log(`Emitted switch-team event for room ${state.roomId}`);
  },

  setRole: (playerId, role) => {
    const state = get();
    socket.emit('set-role', {
      roomId: state.roomId,
      playerId,
      role
    });
  },

  startGame: () => {
    const state = get();
    const updatedState = { 
      phase: 'playing' as GamePhase,
      timeRemaining: 120
    };
    
    set(updatedState);
    saveRoomData(state.roomId, updatedState);

    // Only start timer if we're in the game phase
    if (updatedState.phase === 'playing') {
      const timer = setInterval(() => {
        get().updateTimer();
      }, 1000);
      return () => clearInterval(timer);
    }
  },

  updateTimer: () => {
    const state = get();
    if (state.timeRemaining > 0) {
      const updatedState = { timeRemaining: state.timeRemaining - 1 };
      set(updatedState);
      
      // Emit timer update every 5 seconds or when time is low
      if (state.timeRemaining % 5 === 0 || state.timeRemaining <= 10) {
        socket.emit('timer-update', {
          roomId: state.roomId,
          timeRemaining: state.timeRemaining - 1
        });
      }
    } else if (state.phase === 'playing') {
      // When timer hits 0 in playing phase, transition to guessing
      console.log('Timer expired, transitioning to guessing phase');
      socket.emit('timer-expired', {
        roomId: state.roomId,
        images: state.images,
        timerExpired: true
      });
    }
  },

  switchToGuessing: () => {
    const state = get();
    const updatedState = { 
      phase: 'guessing' as const,
      timeRemaining: 60,
      currentTurn: 'green',
      images: state.images.map(img => ({ 
        ...img, 
        selected: false 
      }))
    };
    
    set(updatedState);
    socket.emit('phase-change', {
      roomId: state.roomId,
      phase: 'guessing',
      images: updatedState.images
    });
    saveRoomData(state.roomId, updatedState);
  },

  addTag: (imageId: string, tag: string, playerNickname: string) => {
    if (!tag.trim()) return;
    
    const state = get();
    const storedPlayerId = localStorage.getItem(`player-${state.roomId}`);
    
    // Create the new tag object
    const newTag = {
      text: tag.trim(),
      playerId: storedPlayerId!,
      playerNickname
    };
    
    // Update local state
    set(state => ({
      images: state.images.map(img =>
        img.id === imageId
          ? {
              ...img,
              tags: [
                ...img.tags.filter(t => t.playerId !== storedPlayerId),
                newTag
              ]
            }
          : img
      )
    }));
    
    // Emit to server to store the tag
    socket.emit('add-tag', {
      roomId: state.roomId,
      imageId,
      tag: tag.trim(),
      playerId: storedPlayerId,
      playerNickname
    });
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
    const storedPlayerId = localStorage.getItem(`player-${state.roomId}`);
    
    // Emit the guess to server
    socket.emit('submit-guess', {
      roomId: state.roomId,
      playerId: storedPlayerId,
      word: word.trim(),
      count
    });
  },

  getPlayerById: (playerId: string) => {
    const state = get();
    return state.players.find(p => p.id === playerId);
  },

  startTimer: () => {
    const interval = setInterval(() => {
      const state = get();
      if (state.timeRemaining > 0) {
        set({ timeRemaining: state.timeRemaining - 1 });
        
        // Emit timer update every second instead of every 5 seconds
        socket.emit('timer-update', {
          roomId: state.roomId,
          timeRemaining: state.timeRemaining - 1
        });
      } else if (state.phase === 'playing') {
        // When timer hits 0 in playing phase, transition to guessing
        console.log('Timer expired, transitioning to guessing phase');
        socket.emit('timer-expired', {
          roomId: state.roomId,
          images: state.images,
          timerExpired: true
        });
        // Clear the interval since we're transitioning phases
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  },

  isMyTurn: () => {
    const state = get();
    const storedPlayerId = localStorage.getItem(`player-${state.roomId}`);
    const currentPlayer = state.players.find(p => p.id === storedPlayerId);
    return currentPlayer?.team === state.currentTurn;
  },
}));

// Listen for room updates
socket.on('room-updated', (updatedRoom: GameState) => {
  const currentState = useGameStore.getState();
  const storedPlayerId = localStorage.getItem(`player-${updatedRoom.id || updatedRoom.roomId}`);

  // Only partition views during the playing phase
  if (updatedRoom.phase === 'playing') {
    updatedRoom.images = updatedRoom.images.map(updatedImg => {
      // During playing phase, only show tags from the current player
      const playerTags = updatedImg.tags.filter((tag: Tag) => tag.playerId === storedPlayerId);
      return {
        ...updatedImg,
        tags: playerTags
      };
    });
  }

  // Update the store with the new state
  useGameStore.getState().initializeGame(updatedRoom);
});

// Listen for image updates
socket.on('image-updated', ({ imageId, image }: { imageId: string, image: GameImage }) => {
  useGameStore.setState(state => ({
    ...state,
    images: state.images.map(img =>
      img.id === imageId ? { ...img, tags: image.tags } : img
    )
  }));
});

// Add a listener for game state
socket.on('game-state', (gameState: GameState) => {
  console.log('Received game state:', gameState);
  useGameStore.getState().initializeGame(gameState);
});