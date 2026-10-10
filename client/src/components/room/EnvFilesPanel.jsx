import { useEffect, useState } from 'react';
import {
  Plus, Search, Eye, EyeOff, Trash2, Download, ShieldCheck, Loader2,
} from 'lucide-react';
import { fetchEncryptedEnv, saveEncryptedEnv } from '../../services/envApi';
import { encryptData } from '../../crypto/encryptData';
import { decryptData } from '../../crypto/decryptData';
import { requireRoomEncryptionKey } from '../../crypto/roomKeyManager';

// Reserved internal keys — never shown in env panel
const RESERVED_KEYS = new Set([
  '__project_overview__',
  '__project_deliverables__',
  '__project_milestones__',
]);

export const EnvFilesPanel = ({ room, roomKeyReady, envVersion }) => {
  const roomId = room?.roomId;

  const [variables, setVariables] = useState([]);
  const [visibleVariables, setVisibleVariables] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleVisibility = (id) => {
    setVisibleVariables((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Load env — filter out reserved internal keys
  useEffect(() => {
    const loadEnv = async () => {
      if (!roomId || !roomKeyReady) return;
      try {
        setIsLoading(true);
        setError('');
        const roomKey = await requireRoomEncryptionKey(roomId);
        const response = await fetchEncryptedEnv(roomId);
        if (response.encryptedEnv == null) {
          setVariables([]);
          return;
        }
        const decryptedJson = await decryptData(response.encryptedEnv, roomKey);
        const all = JSON.parse(decryptedJson);
        setVariables(all.filter((v) => !RESERVED_KEYS.has(v.id) && !RESERVED_KEYS.has(v.key)));
      } catch (err) {
        if (err.status === 404) { setVariables([]); return; }
        setError(err.message || 'Failed to load credentials.');
      } finally {
        setIsLoading(false);
      }
    };
    loadEnv();
  }, [roomId, roomKeyReady, envVersion]);

  // Save helper: read full array, upsert only env vars (preserve reserved keys)
  const saveVariables = async (updatedVars) => {
    const roomKey = await requireRoomEncryptionKey(roomId);
    let all = [];
    const response = await fetchEncryptedEnv(roomId);
    if (response.encryptedEnv) {
      const json = await decryptData(response.encryptedEnv, roomKey);
      all = JSON.parse(json);
    }
    // Keep reserved, replace env vars
    const reserved = all.filter((v) => RESERVED_KEYS.has(v.id) || RESERVED_KEYS.has(v.key));
    const merged = [...reserved, ...updatedVars];
    const encrypted = await encryptData(JSON.stringify(merged), roomKey);
    await saveEncryptedEnv(roomId, encrypted);
    setVariables(updatedVars);
  };

  const addVariable = async (e) => {
    e.preventDefault();
    const key = newKey.trim();
    const value = newValue.trim();
    if (!key || !value || !roomId) return;
    try {
      setIsSaving(true);
      setError('');
      const newVariable = { id: Date.now(), key: key.toUpperCase(), value };
      await saveVariables([...variables, newVariable]);
      setNewKey('');
      setNewValue('');
      setIsAdding(false);
    } catch (err) {
      setError(err.message || 'Failed to save credential.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteVariable = async (id) => {
    if (!roomId) return;
    try {
      setIsSaving(true);
      setError('');
      await saveVariables(variables.filter((v) => v.id !== id));
      setVisibleVariables((prev) => { const u = { ...prev }; delete u[id]; return u; });
    } catch (err) {
      setError(err.message || 'Failed to delete credential.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVariables = variables.filter((v) =>
    v.key.toLowerCase().includes(searchValue.toLowerCase())
  );

  const downloadEnvFile = () => {
    if (!variables.length) return;
    const content = variables.map(({ key, value }) => `${key}=${value}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col h-full overflow-hidden">

      {/* Sub-header */}
      <div className="shrink-0 px-5 py-3 border-b border-surface-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Credentials & Secrets</h3>
          <p className="text-xs text-text-muted mt-0.5">End-to-end encrypted — server never sees plaintext</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadEnvFile}
            disabled={isLoading || variables.length === 0}
            title="Download .env"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-surface-border text-xs text-text-secondary hover:text-text-primary hover:border-brand-mint/50 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            .env
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-5 py-3 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search credentials..."
              className="w-full bg-canvas-black border border-surface-border rounded-button py-2 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint transition-colors"
            />
          </div>
          <span className="hidden sm:block text-xs text-text-muted font-mono whitespace-nowrap">
            {variables.length} secrets
          </span>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-3 border border-red-500/30 bg-red-500/10 rounded-button px-3 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Variables */}
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">

            {/* Empty state */}
            {filteredVariables.length === 0 && !isAdding && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-10 h-10 text-text-muted opacity-40 mb-4" />
                <h3 className="text-sm text-text-primary mb-1">No credentials yet</h3>
                <p className="text-xs text-text-muted mb-4 max-w-xs">
                  Share API keys, environment variables, and deployment credentials — encrypted end-to-end.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Credential
                </button>
              </div>
            )}

            {/* Variables list */}
            {filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className="group border border-surface-border rounded-card bg-surface-elevated hover:border-brand-console transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-text-primary font-mono truncate">{variable.key}</p>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${variable.key}"?`)) {
                          deleteVariable(variable.id);
                        }
                      }}
                      disabled={isSaving}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-text-muted hover:text-semantic-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <input
                      type={visibleVariables[variable.id] ? 'text' : 'password'}
                      value={variable.value}
                      readOnly
                      className="w-full bg-canvas-black border border-surface-border rounded-button py-2 pl-3 pr-9 text-xs text-text-secondary font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(variable.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-brand-mint transition-colors"
                    >
                      {visibleVariables[variable.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add button */}
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full border border-dashed border-surface-border rounded-card p-5 flex items-center justify-center gap-2 text-xs text-text-muted hover:text-brand-mint hover:border-brand-console transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Credential
              </button>
            )}

            {/* Add form */}
            {isAdding && (
              <form onSubmit={addVariable} className="border border-brand-console rounded-card bg-surface-elevated p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-text-primary">Add Credential</p>
                  <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-text-muted hover:text-text-primary">Cancel</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">Key</label>
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="DATABASE_URL"
                      autoFocus
                      className="w-full bg-canvas-black border border-surface-border rounded-button py-2.5 px-3 text-xs text-text-primary font-mono placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-text-muted uppercase mb-1.5">Value</label>
                    <input
                      type="password"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Enter value"
                      className="w-full bg-canvas-black border border-surface-border rounded-button py-2.5 px-3 text-xs text-text-primary font-mono placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={!newKey.trim() || !newValue.trim() || isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    {isSaving ? 'Saving...' : 'Add'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
