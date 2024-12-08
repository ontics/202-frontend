import { Team, GameStats } from '../types';

interface GameOverProps {
  winner: Team | null;
  gameStats?: {
    green: GameStats;
    purple: GameStats;
  };
}

export const GameOver: React.FC<GameOverProps> = ({ winner, gameStats }) => {
  const calculateAverageSimilarity = (stats: GameStats) => {
    if (stats.correctGuesses === 0) return 0;
    return Math.round((stats.totalSimilarity / stats.correctGuesses) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl pointer-events-auto max-w-2xl w-full mx-4">
        <h2 className="text-4xl font-bold text-white text-center mb-6">
          {winner?.toUpperCase()} TEAM WINS!
        </h2>
        
        <div className="grid grid-cols-2 gap-8 text-white">
          <div className={`p-4 rounded-lg ${winner === 'green' ? 'bg-green-900/50' : 'bg-gray-700/50'}`}>
            <h3 className="text-xl font-bold text-green-400 mb-3">Green Team</h3>
            <div className="space-y-2 text-sm">
              <p>Correct Guesses: {gameStats?.green.correctGuesses || 0}</p>
              <p>Incorrect Guesses: {gameStats?.green.incorrectGuesses || 0}</p>
              <p>Average Match Similarity: {calculateAverageSimilarity(gameStats?.green)}%</p>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${winner === 'purple' ? 'bg-purple-900/50' : 'bg-gray-700/50'}`}>
            <h3 className="text-xl font-bold text-purple-400 mb-3">Purple Team</h3>
            <div className="space-y-2 text-sm">
              <p>Correct Guesses: {gameStats?.purple.correctGuesses || 0}</p>
              <p>Incorrect Guesses: {gameStats?.purple.incorrectGuesses || 0}</p>
              <p>Average Match Similarity: {calculateAverageSimilarity(gameStats?.purple)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 