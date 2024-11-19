import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      
      const { roomId } = await response.json();
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold mb-4">Shadow Tag</h1>
        <p className="text-gray-400 mb-8">
          A multiplayer word-guessing game where teams compete to tag and match images.
        </p>
        <button
          onClick={createRoom}
          className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
        >
          Create New Game
        </button>
      </div>
    </div>
  );
}; 