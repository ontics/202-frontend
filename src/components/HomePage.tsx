import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://two02-backend.onrender.com'
  : 'http://localhost:3001';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      console.log('Attempting to create room at:', `${BACKEND_URL}/api/rooms`);
      const response = await fetch(`${BACKEND_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Failed to create room');
      }
      
      const { roomId } = await response.json();
      if (!roomId) {
        throw new Error('No room ID received from server');
      }
      
      console.log('Room created successfully:', roomId);
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