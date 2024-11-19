import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { GameRoom } from './components/GameRoom';
import { Lobby } from './components/Lobby';

// Create a wrapper component to handle the route params
const LobbyWrapper: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  return <Lobby roomId={roomId!} />;
};

// Create a wrapper for GameRoom if it needs the roomId param
const GameRoomWrapper: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  return <GameRoom roomId={roomId!} />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<LobbyWrapper />} />
        <Route path="/room/:roomId/game" element={<GameRoomWrapper />} />
      </Routes>
    </Router>
  );
};

export default App;