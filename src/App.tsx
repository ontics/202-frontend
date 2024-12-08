import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { GameRoom } from './components/GameRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<GameRoom />} />
        <Route path="/game/:roomId" element={<GameRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;