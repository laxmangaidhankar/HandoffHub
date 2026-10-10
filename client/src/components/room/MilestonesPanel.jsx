import { useState, useEffect } from 'react';
import {
  Flag, Plus, Trash2, Loader2, CheckCircle2, Circle, Clock, AlertCircle,
} from 'lucide-react';
import { encryptData } from '../../crypto/encryptData';
import { decryptData } from '../../crypto/decryptData';
import { requireRoomEncryptionKey } from '../../crypto/roomKeyManager';
import { fetchEncryptedEnv, saveEncryptedEnv } from '../../services/envApi';

const MILESTONES_KEY = '__project_milestones__';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',           icon: Circle,       color: 'text-text-muted',       bg: 'bg-surface-border/50' },
  in_progress: { label: 'In Progress',       icon: Clock,        color: 'text-semantic-warning',  bg: 'bg-semantic-warning/10' },
  review:      { label: 'Under Review',      icon: AlertCircle,  color: 'text-semantic-info',     bg: 'bg-semantic-info/10' },
  approved:    { label: 'Approved',          icon: CheckCircle2, color: 'text-semantic-success',  bg: 'bg-semantic-success/10' },
  changes_req: { label: 'Changes Requested', icon: AlertCircle,  color: 'text-semantic-danger',   bg: 'bg-semantic-danger/10' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-transparent ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

export const MilestonesPanel = ({ room, roomKeyReady, envVersion }) => {
  const roomId = room?.roomId;
  const [milestones, setMilestones] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!roomId || !roomKeyReady) return;
      try {
        setIsLoading(true);
        const roomKey = await requireRoomEncryptionKey(roomId);
        const response = await fetchEncryptedEnv(roomId);
        if (!response.encryptedEnv) { setIsLoading(false); return; }
        const json = await decryptData(response.encryptedEnv, roomKey);
        const all = JSON.parse(json);
        const found = all.find((i) => i.id === MILESTONES_KEY);
        if (found?.value) {
          try { setMilestones(JSON.parse(found.value)); } catch (_) {}
        }
      } catch (_) {
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [roomId, roomKeyReady, envVersion]);

  const saveMilestones = async (updated) => {
    const roomKey = await requireRoomEncryptionKey(roomId);
    let all = [];
    const response = await fetchEncryptedEnv(roomId);
    if (response.encryptedEnv) {
      const json = await decryptData(response.encryptedEnv, roomKey);
      all = JSON.parse(json);
    }
    const entry = { id: MILESTONES_KEY, key: MILESTONES_KEY, value: JSON.stringify(updated) };
    const idx = all.findIndex((i) => i.id === MILESTONES_KEY);
    if (idx >= 0) all[idx] = entry; else all.push(entry);
    const encrypted = await encryptData(JSON.stringify(all), roomKey);
    await saveEncryptedEnv(roomId, encrypted);
    setMilestones(updated);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      setIsSaving(true);
      setError('');
      const newItem = {
        id: Date.now(),
        title: form.title.trim(),
        description: form.description.trim(),
        deadline: form.deadline,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      await saveMilestones([...milestones, newItem]);
      setForm({ title: '', description: '', deadline: '' });
      setIsAdding(false);
    } catch (err) {
      setError(err.message || 'Failed to save milestone.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setIsSaving(true);
      await saveMilestones(milestones.map((m) => m.id === id ? { ...m, status } : m));
    } catch (err) {
      setError(err.message || 'Failed to update milestone.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsSaving(true);
      await saveMilestones(milestones.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete milestone.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
      </div>
    );
  }

  const completedCount = milestones.filter((m) => m.status === 'approved').length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sub-header */}
      <div className="shrink-0 px-5 py-3 border-b border-surface-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Milestones</h3>
            <p className="text-xs text-text-muted mt-0.5">Track progress and client approvals</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
        {milestones.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-text-muted">{completedCount}/{milestones.length} approved</span>
              <span className="text-[10px] font-mono text-brand-mint">{progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-mint rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mt-3 border border-red-500/30 bg-red-500/10 rounded-button px-3 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {milestones.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Flag className="w-10 h-10 text-text-muted opacity-40 mb-4" />
            <h3 className="text-sm text-text-primary mb-1">No milestones yet</h3>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              Define project milestones that the client can review and approve.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Add form */}
          {isAdding && (
            <form onSubmit={handleAdd} className="border border-brand-console rounded-card bg-surface-elevated p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-text-primary">New Milestone</p>
                <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-text-muted hover:text-text-primary">Cancel</button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Backend API Complete"
                    autoFocus
                    className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">Description (optional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="What is included in this milestone?"
                    className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">Deadline (optional)</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-mint"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={!form.title.trim() || isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  {isSaving ? 'Saving...' : 'Add'}
                </button>
              </div>
            </form>
          )}

          {/* Milestone cards */}
          {milestones.map((m) => (
            <div key={m.id} className="group border border-surface-border rounded-card bg-surface-elevated hover:border-brand-console/50 transition-colors p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-medium text-text-primary">{m.title}</p>
                    <StatusBadge status={m.status} />
                  </div>
                  {m.description && (
                    <p className="text-xs text-text-secondary mb-2 leading-relaxed">{m.description}</p>
                  )}
                  {m.deadline && (
                    <p className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(m.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={isSaving}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-text-muted hover:text-semantic-danger shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status controls */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-surface-border">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(m.id, key)}
                    disabled={isSaving || m.status === key}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                      m.status === key
                        ? `${cfg.bg} ${cfg.color} border-transparent`
                        : 'border-surface-border text-text-muted hover:border-brand-mint/40 hover:text-text-primary'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
