import { io } from '../index.js';

export const sendNotification = (userId, message) => {
  io.to(userId).emit('notification', { message });
};

export const joinUserRoom = (socket, userId) => {
  socket.join(userId);
};
