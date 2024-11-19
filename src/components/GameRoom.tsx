import { useGameStore } from '../store';
import { Lobby } from './Lobby';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { GameInstructions } from './GameInstructions';
import { GameOver } from './GameOver';
import { useEffect } from 'react';

interface GameRoomProps {
  roomId: string;
}

export const GameRoom: React.FC<GameRoomProps> = ({ roomId }) => {
  const { phase, initializeGame, winner, gameStats } = useGameStore(state => ({
    phase: state.phase,
    initializeGame: state.initializeGame,
    winner: state.winner,
    gameStats: state.gameStats
  }));
  
  useEffect(() => {
    if (roomId) {
      initializeGame(roomId);
    }
  }, [roomId, initializeGame]);

  if (!roomId) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      {phase === 'lobby' && <Lobby roomId={roomId} />}
      {phase === 'tagging' && (
        <>
          <GameBoard />
          <GameControls />
          <GameInstructions />
        </>
      )}
      {phase === 'guessing' && (
        <>
          <GameBoard />
          <GameControls />
          <GameInstructions />
        </>
      )}
      {phase === 'gameOver' && (
        <GameOver 
          winner={winner}
          gameStats={gameStats}
        />
      )}
    </div>
  );
}; 