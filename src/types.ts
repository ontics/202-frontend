export type Team = 'green' | 'purple';
export type GamePhase = 'lobby' | 'playing' | 'guessing' | 'gameOver';
export type PlayerRole = 'codebreaker' | 'tagger';

export interface Player {
  id: string;
  nickname: string;
  team: Team;
  role: PlayerRole;
  isRoomAdmin: boolean;
  roomId: string;
}

export interface Tag {
  text: string;
  playerId: string;
  playerNickname: string;
}

export interface GameImage {
  id: string;
  url: string;
  team: Team | 'red';
  tags: Tag[];
  selected: boolean;
  matched: boolean;
  matchedWord: string;
  matchedTag?: Tag;
  defaultDescription?: string;
  similarity: number;
  formattedSimilarity?: string;
}

export interface GameStats {
  matches: number;
  avgSimilarity: string;
}

export interface GameState {
  id: string;
  roomId: string;
  phase: GamePhase;
  players: Player[];
  images: GameImage[];
  currentTurn: Team;
  timeRemaining: number;
  winner: Team | null;
  gameStats?: {
    green: GameStats;
    purple: GameStats;
  };
}

export interface GameStore extends GameState {
  initializeGame: (roomId: string) => void;
  addPlayer: (nickname: string) => string;
  switchTeam: (playerId: string, team: Team) => void;
  setRole: (playerId: string, role: PlayerRole) => void;
  startGame: () => void;
}