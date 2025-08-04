import { io } from 'socket.io-client';

const URL = import.meta.env.MODE === 'production' ? 'YOUR_PRODUCTION_URL' : 'http://localhost:3000';//backend port

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true
});
