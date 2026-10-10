import { useState, useEffect } from 'react';
import {
  FolderKanban, Plus, Save, Loader2, X,
  GitBranch, Globe, FileText, Layers,
} from 'lucide-react';
import { encryptData } from '../../crypto/encryptData';
import { decryptData } from '../../crypto/decryptData';
import { requireRoomEncryptionKey } from '../../crypto/roomKeyManager';
import { fetchEncryptedEnv, saveEncryptedEnv } from '../../services/envApi';

const OVERVIEW_KEY = '__project_overview__';

const defaultOverview = {
  description: '',
  techStack: [],
  timeline: '',
  notes: '',
};

export const OverviewPanel = ({ room, roomKeyReady, envVersion }) => {
  const roomId = room?.roomId;
  const [overview, setOverview] = useState(defaultOverview);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(defaultOverview);
  const [newTech, setNewTech] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Load overview from encrypted store
  useEffect(() => {
    const load = async () => {
      if (!roomId || !roomKeyReady) return;
      try {
        setIsLoading(true);
        const roomKey = await requireRoomEncryptionKey(roomId);
        const response = await fetchEncryptedEnv(roomId);
        if (!response.encryptedEnv) {
          setIsLoading(false);
          return;
        }
        const json = await decryptData(response.encryptedEnv, roomKey);
        const all = JSON.parse(json);
        const found = all.find((item) => item.id === OVERVIEW_KEY);
        if (found?.value) {
          try {
            const parsed = JSON.parse(found.value);
            setOverview(parsed);
          } catch (_) {}
        }
      } catch (_) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [roomId, roomKeyReady, envVersion]);

  const startEdit = () => {
    setEditDraft({ ...overview });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setNewTech('');
    setError('');
  };

  const addTech = (e) => {
    e.preventDefault();
    const val = newTech.trim();
    if (!val) return;
    setEditDraft((d) => ({ ...d, techStack: [...(d.techStack || []), val] }));
    setNewTech('');
  };

  const removeTech = (idx) => {
    setEditDraft((d) => ({ ...d, techStack: d.techStack.filter((_, i) => i !== idx) }));
  };

  const save = async () => {
    if (!roomId) return;
    try {
      setIsSaving(true);
      setError('');
      const roomKey = await requireRoomEncryptionKey(roomId);
      // Load existing full array
      let all = [];
      const response = await fetchEncryptedEnv(roomId);
      if (response.encryptedEnv) {
        const json = await decryptData(response.encryptedEnv, roomKey);
        all = JSON.parse(json);
      }
      // Upsert the overview entry
      const overviewEntry = { id: OVERVIEW_KEY, key: OVERVIEW_KEY, value: JSON.stringify(editDraft) };
      const existingIdx = all.findIndex((i) => i.id === OVERVIEW_KEY);
      if (existingIdx >= 0) all[existingIdx] = overviewEntry;
      else all.push(overviewEntry);

      const encrypted = await encryptData(JSON.stringify(all), roomKey);
      await saveEncryptedEnv(roomId, encrypted);
      setOverview({ ...editDraft });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save overview.');
    } finally {
      setIsSaving(false);
    }
  };

  const isEmpty = !overview.description && !overview.techStack?.length && !overview.timeline && !overview.notes;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sub-header */}
      <div className="shrink-0 px-5 py-3 border-b border-surface-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{room?.roomName || 'Project'}</h3>
          <p className="text-xs text-text-muted mt-0.5">Overview & requirements</p>
        </div>
        {!isEditing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-surface-border rounded-button text-text-secondary hover:text-brand-mint hover:border-brand-mint/50 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="mx-5 mt-3 border border-red-500/30 bg-red-500/10 rounded-button px-3 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {isEmpty && !isEditing && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="w-10 h-10 text-text-muted opacity-40 mb-4" />
            <h3 className="text-sm text-text-primary mb-1">No overview yet</h3>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              Add the project description, technology stack, timeline, and notes.
            </p>
            <button
              onClick={startEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Overview
            </button>
          </div>
        )}

        {!isEditing && !isEmpty && (
          <div className="space-y-6">
            {overview.description && (
              <section>
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{overview.description}</p>
              </section>
            )}
            {overview.techStack?.length > 0 && (
              <section>
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Technology Stack</p>
                <div className="flex flex-wrap gap-2">
                  {overview.techStack.map((t, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border text-xs text-text-primary">
                      <Layers className="w-3 h-3 text-brand-mint" />
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {overview.timeline && (
              <section>
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Timeline</p>
                <p className="text-sm text-text-primary whitespace-pre-wrap">{overview.timeline}</p>
              </section>
            )}
            {overview.notes && (
              <section>
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{overview.notes}</p>
              </section>
            )}
          </div>
        )}

        {isEditing && (
          <div className="space-y-5">
            {/* Description */}
            <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">
                Project Description
              </label>
              <textarea
                value={editDraft.description}
                onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                rows={4}
                placeholder="Describe the project, its goals, and scope..."
                className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint resize-none"
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">
                Technology Stack
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editDraft.techStack?.map((t, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-elevated border border-surface-border text-xs text-text-primary">
                    {t}
                    <button onClick={() => removeTech(i)} className="hover:text-semantic-danger ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={addTech} className="flex gap-2">
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  className="flex-1 bg-canvas-black border border-surface-border rounded-button px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                />
                <button type="submit" className="px-3 py-2 rounded-button bg-surface-elevated border border-surface-border text-xs text-text-secondary hover:text-brand-mint transition-colors">
                  Add
                </button>
              </form>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">
                Timeline
              </label>
              <input
                type="text"
                value={editDraft.timeline}
                onChange={(e) => setEditDraft((d) => ({ ...d, timeline: e.target.value }))}
                placeholder="e.g. 6 weeks, MVP by Dec 1"
                className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <textarea
                value={editDraft.notes}
                onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                rows={3}
                placeholder="Additional notes, special requirements, or context..."
                className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint resize-none"
              />
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-button border border-surface-border text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
