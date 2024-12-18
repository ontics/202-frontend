import { useGameStore } from '../store';
import { Lobby } from './Lobby';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { GameOver } from './GameOver';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';

export const GameRoom: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { phase, initializeGame, winner, gameStats, getPlayerById, startTimer } = useGameStore();

  // Handle room joining
  useEffect(() => {
    if (!roomId) return;
    
    const storedPlayerId = localStorage.getItem(`player-${roomId}`);
    const currentPlayer = storedPlayerId ? getPlayerById(storedPlayerId) : null;
    
    if (currentPlayer) {
      socket.emit('join-room', { roomId, player: currentPlayer });
    }
  }, [roomId, getPlayerById]);

  // Handle timer
  useEffect(() => {
    let timerInterval: (() => void) | undefined;
    
    if (phase === 'playing') {
      console.log('Starting timer for playing phase');
      timerInterval = startTimer();
    }

    return () => {
      if (timerInterval) {
        console.log('Cleaning up timer');
        timerInterval();
      }
    };
  }, [phase, startTimer]);

  const isGameRoute = window.location.pathname.startsWith('/game/');
  
  return (
    <div className="min-h-screen bg-gray-900">
      {!isGameRoute && phase === 'lobby' && <Lobby roomId={roomId} />}
      {(isGameRoute || phase === 'playing' || phase === 'guessing' || phase === 'gameOver') && (
        <div className="relative">
          <GameBoard />
          {phase !== 'gameOver' && <GameControls />}
          {phase === 'gameOver' && <GameOver winner={winner} gameStats={gameStats} />}
        </div>
      )}
    </div>
  );
}; 