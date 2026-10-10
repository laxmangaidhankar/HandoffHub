import React from 'react';

import './styles/globals.css';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import RoomLayout from './layout/RoomLayout';
import RoomCreatedPage from './pages/RoomCreatedPage';


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-canvas-black text-text-primary selection:bg-brand-mint selection:text-canvas-black">

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreateRoomPage />} />

            <Route path="/join" element={<JoinRoomPage />} />
            <Route path="/room-created" element={<RoomCreatedPage />} />

            <Route
              path="/room/:roomId"
              element={<RoomLayout />}
            />

            <Route path="/join/:roomId" element={<JoinRoomPage />} />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}