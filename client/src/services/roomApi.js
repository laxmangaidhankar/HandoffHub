import axios from 'axios';

import config from '../config/env';

const API_BASE = config.apiBaseUrl;

const api = axios.create({
  baseURL: API_BASE,

  headers: {
    'Content-Type': 'application/json'
  },

  withCredentials: true
});

export const roomApi = {
  createRoom: async ({ roomName, displayName, durationMinutes = 1440 }) => {
    const response = await api.post('/api/v1/rooms', {
      roomName,
      displayName,
      durationMinutes
    });

    return response.data;
  },

 getRoomStatus: async (roomId) => {
    const response = await api.get(
      `/api/v1/rooms/${roomId}/status`
    );

    return response.data;
  },

   getRoom: async (roomId) => {
    const response = await api.get(
      `/api/v1/rooms/${roomId}`
    );

    return response.data;
  },

  joinRoom: async (roomId, data) => {
    const response = await api.post(
      `/api/v1/rooms/${roomId}/join`,
      data
    );

    return response.data;
  },


};