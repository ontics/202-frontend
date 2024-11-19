import { GamePhase, PlayerRole } from '../types';
import { useGameStore } from '../store';

export const GameInstructions: React.FC = () => {
  const { phase, currentTurn, players } = useGameStore();
  const currentPlayer = players.find(p => p.id === 'current-player-id'); // You'll need to track current player ID

  const getMessage = (): string => {
    if (phase === 'tagging') {
      return "Click on image(s) to add as many descriptive tags as you can!";
    }

    if (phase === 'guessing') {
      if (currentPlayer?.team === currentTurn) {
        if (currentPlayer?.role === 'codebreaker') {
          return "Enter a word and number to match with your team's images!";
        } else {
          return "Wait for your Codebreaker to make a guess...";
        }
      } else {
        return "Opponent's turn...";
      }
    }

    return "";
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-lg">
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}; 