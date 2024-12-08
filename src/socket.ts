import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001';
export const socket = io.connect(BACKEND_URL); 