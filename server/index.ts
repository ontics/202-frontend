// import express from 'express';
// import { Server } from 'socket.io';
// import http from 'http';
// import { nanoid } from 'nanoid';
// import cors from 'cors';

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Your frontend URL
//     methods: ["GET", "POST"]
//   }
// });

// // Enable CORS for all routes
// app.use(cors({
//   origin: "http://localhost:5173" // Your frontend URL
// }));

// app.use(express.json());

// // In-memory store (replace with a database in production)
// const rooms = new Map();

// const SAMPLE_IMAGES = [
//   'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
//   'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
//   'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
//   'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
//   'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
//   'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
//   'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f',
//   'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1',
//   'https://images.unsplash.com/photo-1682686581498-5e85c7228119',
// ].map(url => `${url}?auto=format&fit=crop&w=400&h=300&q=80`);

// interface Player {
//   id: string;
//   nickname: string;
//   team: Team;
//   role: PlayerRole;
//   isRoomAdmin: boolean;
//   roomId: string;
// }

// type Team = 'green' | 'purple';
// type PlayerRole = 'codebreaker' | 'tagger';

// // REST endpoints
// app.post('/api/rooms', (_req, res) => {
//   const roomId = nanoid(6);
//   rooms.set(roomId, {
//     id: roomId,
//     players: [],
//     phase: 'lobby',
//     images: SAMPLE_IMAGES.map(url => ({
//       id: nanoid(),
//       url,
//       team: Math.random() < 0.5 ? 'green' : 'purple',
//       tags: [],
//       selected: false,
//       matched: false,
//       matchedWord: '',
//       similarity: 0
//     })),
//     currentTurn: 'green',
//     timeRemaining: 60,
//     winner: null,
//   });
//   res.json({ roomId });
// });

// app.get('/api/rooms/:roomId', (req, res) => {
//   const room = rooms.get(req.params.roomId);
//   if (!room) {
//     res.status(404).json({ error: 'Room not found' });
//     return;
//   }
//   res.json(room);
// });

// // Socket.IO events
// io.on('connection', (socket) => {
//   socket.on('join-room', ({ roomId, player }) => {
//     const room = rooms.get(roomId);
//     if (!room) return;

//     socket.join(roomId);
//     room.players.push(player);
//     io.to(roomId).emit('room-updated', room);
//   });

//   socket.on('switch-team', ({ roomId, playerId, newTeam }) => {
//     const room = rooms.get(roomId);
//     if (!room) return;

//     room.players = room.players.map((p: Player) =>
//       p.id === playerId ? { ...p, team: newTeam } : p
//     );
//     io.to(roomId).emit('room-updated', room);
//   });

//   // Add other game events...
// });

// server.listen(3001, () => {
//   console.log('Server running on port 3001');
// }); 