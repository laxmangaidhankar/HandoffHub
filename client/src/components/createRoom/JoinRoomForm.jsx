import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, KeyRound, User } from 'lucide-react';
import { motion } from 'framer-motion';

import { roomApi } from '../../services/roomApi';

export const JoinRoomForm = () => {
  const [roomKey, setRoomKey] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // STEP 1: Check whether project exists
  const handleRoomCheck = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedRoomKey = roomKey.trim();
    if (!trimmedRoomKey) {
      setError('Enter the project ID');
      return;
    }

    setLoading(true);
    try {
      const response = await roomApi.getRoomStatus(trimmedRoomKey);
      if (!response.success || !response.room) throw new Error('Project not found.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Project not found.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Authenticate and join
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedRoomKey = roomKey.trim();
    const trimmedAccessKey = accessKey.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedAccessKey) { setError('Enter the access key'); return; }
    if (!trimmedDisplayName) { setError('Enter your display name'); return; }
    if (trimmedDisplayName.length > 40) { setError('Display name must be 40 characters or less'); return; }

    setLoading(true);
    try {
      const response = await roomApi.joinRoom(trimmedRoomKey, {
        accessKey: trimmedAccessKey,
        displayName: trimmedDisplayName,
      });

      if (!response.success) throw new Error(response.error || 'Failed to join project.');
      navigate(`/room/${trimmedRoomKey}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to join project.');
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
          Join a project
        </h2>
        <p className="text-body text-text-secondary">
          {step === 1
            ? 'Enter the project ID to continue.'
            : 'Enter your access key and display name.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-semantic-danger/10 border border-semantic-danger/30 text-semantic-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleRoomCheck} className="flex flex-col gap-5">
          <div>
            <label className="block text-mono text-text-secondary text-xs mb-1.5">
              PROJECT ID
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={roomKey}
                maxLength={6}
                onChange={(e) => setRoomKey(e.target.value.toUpperCase())}
                autoComplete="off"
                className="w-full bg-canvas-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors font-mono"
                placeholder="e.g. AB1234"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-text-primary text-canvas-black rounded-button py-3 mt-3 font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={handleJoinRoom} className="flex flex-col gap-5">
          <div>
            <label className="block text-mono text-text-secondary text-xs mb-1.5">
              PROJECT ID
            </label>
            <input
              type="text"
              value={roomKey}
              readOnly
              className="w-full bg-canvas-black/50 border border-surface-border rounded-lg px-4 py-3 text-body text-text-secondary font-mono"
            />
          </div>

          <div>
            <label className="block text-mono text-text-secondary text-xs mb-1.5">
              ACCESS KEY
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="password"
                value={accessKey}
                maxLength={8}
                onChange={(e) => setAccessKey(e.target.value)}
                autoComplete="off"
                className="w-full bg-canvas-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors font-mono"
                placeholder="Enter access key"
              />
            </div>
          </div>

          <div>
            <label className="block text-mono text-text-secondary text-xs mb-1.5">
              YOUR NAME
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                autoComplete="nickname"
                className="w-full bg-canvas-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
                placeholder="e.g. Sarah — Client"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-text-primary text-canvas-black rounded-button py-3 mt-3 font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Joining Project...' : 'Join Project'}
          </button>

          <button
            type="button"
            onClick={() => { setStep(1); setAccessKey(''); setDisplayName(''); setError(''); }}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            ← Change Project ID
          </button>
        </form>
      )}
    </motion.div>
  );
};
