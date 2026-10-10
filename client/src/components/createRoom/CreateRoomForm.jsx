import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { roomApi } from '../../services/roomApi';
import {
  createRoomEncryptionKey,
  getOrCreateIdentity,
} from '../../crypto/roomKeyManager';
import { createChatEncryptionKey } from '../../crypto/chatKeyManager';

export const CreateRoomForm = () => {
  const [projectName, setProjectName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedProjectName = projectName.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedProjectName) {
      setError('Please enter a project name.');
      return;
    }
    if (!trimmedDisplayName) {
      setError('Please enter your name.');
      return;
    }
    if (trimmedProjectName.length < 3) {
      setError('Project name must be at least 3 characters.');
      return;
    }

    try {
      setLoading(true);

      const response = await roomApi.createRoom({
        roomName: trimmedProjectName,
        displayName: trimmedDisplayName,
        durationMinutes: 1440,
      });

      if (!response.success || !response.room) {
        throw new Error(response.error || 'Failed to create project.');
      }

      const { roomId, accessKey, roomName, expiresAt } = response.room;

      await createRoomEncryptionKey(roomId);
      await createChatEncryptionKey(roomId);
      await getOrCreateIdentity();

      navigate('/room-created', {
        state: { roomId, roomName, accessKey, expiresAt },
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'An error occurred while creating the project.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-surface-slate border border-surface-border p-8 rounded-2xl shadow-xl w-full"
    >
      <div className="mb-8">
        <h2 className="text-heading-lg text-text-primary mb-2 text-2xl">
          Start a project
        </h2>
        <p className="text-body text-text-secondary">
          Create a secure handoff space for your project.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-semantic-danger/10 border border-semantic-danger/30 text-semantic-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateRoom} className="flex flex-col gap-5">
        {/* Project Name */}
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">
            PROJECT NAME
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            maxLength={40}
            autoFocus
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="e.g. E-Commerce Website"
          />
        </div>

        {/* Your Name */}
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">
            YOUR NAME (DEVELOPER)
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="e.g. Alex — Lead Developer"
          />
        </div>

        <p className="text-xs text-text-secondary">
          The project space will automatically expire after 24 hours.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-text-primary text-canvas-black rounded-button py-3 mt-3 font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating Project...' : 'Create Project'}
        </button>
      </form>
    </motion.div>
  );
};
