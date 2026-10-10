import { useState, useEffect } from 'react';
import {
  Link2, Plus, Trash2, Loader2, ExternalLink,
  GitBranch, Globe, FileText, Image, Package,
} from 'lucide-react';
import { encryptData } from '../../crypto/encryptData';
import { decryptData } from '../../crypto/decryptData';
import { requireRoomEncryptionKey } from '../../crypto/roomKeyManager';
import { fetchEncryptedEnv, saveEncryptedEnv } from '../../services/envApi';

const DELIVERABLES_KEY = '__project_deliverables__';

const DELIVERABLE_TYPES = [
  { value: 'repo', label: 'Repository', icon: GitBranch },
  { value: 'demo', label: 'Live Demo', icon: Globe },
  { value: 'design', label: 'Design', icon: Image },
  { value: 'docs', label: 'Documentation', icon: FileText },
  { value: 'other', label: 'Other', icon: Package },
];

const TypeIcon = ({ type, className }) => {
  const found = DELIVERABLE_TYPES.find((t) => t.value === type);
  const Icon = found?.icon || Link2;
  return <Icon className={className} />;
};

export const DeliverablesPanel = ({ room, roomKeyReady, envVersion }) => {
  const roomId = room?.roomId;
  const [items, setItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ label: '', url: '', type: 'repo', milestone: '' });
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
        const found = all.find((i) => i.id === DELIVERABLES_KEY);
        if (found?.value) {
          try { setItems(JSON.parse(found.value)); } catch (_) {}
        }
      } catch (_) {
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [roomId, roomKeyReady, envVersion]);

  const saveItems = async (updated) => {
    const roomKey = await requireRoomEncryptionKey(roomId);
    let all = [];
    const response = await fetchEncryptedEnv(roomId);
    if (response.encryptedEnv) {
      const json = await decryptData(response.encryptedEnv, roomKey);
      all = JSON.parse(json);
    }
    const entry = { id: DELIVERABLES_KEY, key: DELIVERABLES_KEY, value: JSON.stringify(updated) };
    const idx = all.findIndex((i) => i.id === DELIVERABLES_KEY);
    if (idx >= 0) all[idx] = entry; else all.push(entry);
    const encrypted = await encryptData(JSON.stringify(all), roomKey);
    await saveEncryptedEnv(roomId, encrypted);
    setItems(updated);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) return;
    try {
      setIsSaving(true);
      setError('');
      const newItem = {
        id: Date.now(),
        label: form.label.trim(),
        url: form.url.trim(),
        type: form.type,
        milestone: form.milestone.trim(),
        addedAt: new Date().toISOString(),
      };
      await saveItems([...items, newItem]);
      setForm({ label: '', url: '', type: 'repo', milestone: '' });
      setIsAdding(false);
    } catch (err) {
      setError(err.message || 'Failed to save deliverable.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsSaving(true);
      await saveItems(items.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete deliverable.');
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

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sub-header */}
      <div className="shrink-0 px-5 py-3 border-b border-surface-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Deliverables</h3>
          <p className="text-xs text-text-muted mt-0.5">Repos, demos, docs, and design links</p>
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

      {error && (
        <div className="mx-5 mt-3 border border-red-500/30 bg-red-500/10 rounded-button px-3 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {items.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Link2 className="w-10 h-10 text-text-muted opacity-40 mb-4" />
            <h3 className="text-sm text-text-primary mb-1">No deliverables yet</h3>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              Share repository links, live demos, design files, and API documentation.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Deliverable
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Add form */}
          {isAdding && (
            <form
              onSubmit={handleAdd}
              className="border border-brand-console rounded-card bg-surface-elevated p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-text-primary">Add Deliverable</p>
                <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-text-muted hover:text-text-primary">Cancel</button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-mint"
                  >
                    {DELIVERABLE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">Label</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Frontend Repository"
                    autoFocus
                    className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">URL</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">Milestone (optional)</label>
                  <input
                    type="text"
                    value={form.milestone}
                    onChange={(e) => setForm((f) => ({ ...f, milestone: e.target.value }))}
                    placeholder="e.g. Phase 1, MVP"
                    className="w-full bg-canvas-black border border-surface-border rounded-button px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={!form.label.trim() || !form.url.trim() || isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  {isSaving ? 'Saving...' : 'Add'}
                </button>
              </div>
            </form>
          )}

          {/* Deliverable cards */}
          {items.map((item) => (
            <div
              key={item.id}
              className="group border border-surface-border rounded-card bg-surface-elevated hover:border-brand-console transition-colors p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-border flex items-center justify-center shrink-0 mt-0.5">
                  <TypeIcon type={item.type} className="w-4 h-4 text-brand-mint" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">{item.label}</p>
                    {item.milestone && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue whitespace-nowrap">
                        {item.milestone}
                      </span>
                    )}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-text-muted hover:text-brand-mint transition-colors flex items-center gap-1 mt-0.5 truncate"
                  >
                    <span className="truncate">{item.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isSaving}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-text-muted hover:text-semantic-danger shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
