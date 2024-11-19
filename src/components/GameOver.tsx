interface GameOverProps {
  winner: Team | null;
  gameStats?: {
    green: GameStats;
    purple: GameStats;
  };
}

export const GameOver: React.FC<GameOverProps> = ({ winner, gameStats }) => {
  return (
    <div className="game-over">
      <h2>Game Over!</h2>
      {winner ? (
        <h3>{winner.charAt(0).toUpperCase() + winner.slice(1)} Team Wins!</h3>
      ) : (
        <h3>It's a Tie!</h3>
      )}
      
      {gameStats && (
        <div className="game-stats">
          <div className="team-stats green">
            <h4>Green Team</h4>
            <p>Matches: {gameStats.green.matches}</p>
            <p>Average Similarity: {gameStats.green.avgSimilarity}</p>
          </div>
          <div className="team-stats purple">
            <h4>Purple Team</h4>
            <p>Matches: {gameStats.purple.matches}</p>
            <p>Average Similarity: {gameStats.purple.avgSimilarity}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 