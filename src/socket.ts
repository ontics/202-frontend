import io from 'socket.io-client';

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://two02-backend.onrender.com'
  : 'http://localhost:3001';

export const socket = io(BACKEND_URL, {
  transports: ['websocket'],
  autoConnect: true
}); 