import React, { useState } from 'react';
import { useGameStore } from '../store';
import { Users, Copy, ArrowLeftRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

type Team = 'green' | 'purple';

interface LobbyProps {
  roomId: string;
}

export const Lobby: React.FC<LobbyProps> = ({ roomId }) => {
  const [nickname, setNickname] = useState('');
  const [copied, setCopied] = useState(false);
  const { players, addPlayer, switchTeam, setRole, startGame, getPlayerById } = useGameStore();
  const navigate = useNavigate();

  // Get current player from localStorage
  const storedPlayerId = localStorage.getItem(`player-${roomId}`);
  const currentPlayer = storedPlayerId ? getPlayerById(storedPlayerId) : null;
  const isAdmin = currentPlayer?.isRoomAdmin ?? false;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    
    if (!storedPlayerId || !getPlayerById(storedPlayerId)) {
      try {
        const playerId = await addPlayer(nickname.trim(), roomId);
        localStorage.setItem(`player-${roomId}`, playerId);
        setNickname('');
      } catch (error) {
        console.error('Error joining game:', error);
      }
    }
  };

  const handleSwitchTeam = (playerId: string, newTeam: Team) => {
    if (currentPlayer && currentPlayer.id === playerId) {
      switchTeam(playerId, newTeam);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy room link:', error);
    }
  };

  const handleStartGame = () => {
    console.log('Emitting start-game event for room:', roomId);
    socket.emit('start-game', roomId);
    navigate(`/game/${roomId}`);
  };

  // If player hasn't joined yet or their stored ID is invalid, show join form
  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <h1 className="text-3xl font-bold text-center mb-8">Join Game</h1>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname..."
              className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              required
              minLength={2}
              maxLength={20}
            />
            <button
              type="submit"
              disabled={!nickname.trim()}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show team management UI for joined players
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Shadow Tag</h1>
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Room Link'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Green Team */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Green
              </h2>
              <div className="space-y-2">
                {players
                  .filter(p => p.team === 'green')
                  .map(player => (
                    <div key={player.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        {player.isRoomAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
                        {player.role === 'codebreaker' && (
                          <span className="text-lg" title="Codebreaker">🕵️</span>
                        )}
                        <span>{player.nickname}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentPlayer.id === player.id && (
                          <button
                            onClick={() => handleSwitchTeam(player.id, 'purple')}
                            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            Switch Team
                          </button>
                        )}
                        {isAdmin && player.id !== currentPlayer.id && player.role !== 'codebreaker' && (
                          <button
                            onClick={() => setRole(player.id, 'codebreaker')}
                            className="text-sm text-gray-400 hover:text-white"
                          >
                            Make Codebreaker
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Purple Team */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Purple
              </h2>
              <div className="space-y-2">
                {players
                  .filter(p => p.team === 'purple')
                  .map(player => (
                    <div key={player.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        {player.isRoomAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
                        {player.role === 'codebreaker' && (
                          <span className="text-lg" title="Codebreaker">🕵️</span>
                        )}
                        <span>{player.nickname}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentPlayer.id === player.id && (
                          <button
                            onClick={() => handleSwitchTeam(player.id, 'green')}
                            className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            Switch Team
                          </button>
                        )}
                        {isAdmin && player.id !== currentPlayer.id && player.role !== 'codebreaker' && (
                          <button
                            onClick={() => setRole(player.id, 'codebreaker')}
                            className="text-sm text-gray-400 hover:text-white"
                          >
                            Make Codebreaker
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleStartGame}
              className="mt-8 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};