import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Check, Download, ArrowRight, PackageCheck } from 'lucide-react';

const RoomCreatedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState('');

  const roomData = location.state;

  if (!roomData?.roomId || !roomData?.accessKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-black text-text-primary px-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center mx-auto mb-4">
            <PackageCheck className="w-6 h-6 text-text-muted" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Credentials unavailable</h1>
          <p className="text-text-secondary text-sm mb-6">
            Project credentials are only shown immediately after creation.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-button bg-brand-mint text-canvas-black font-mono text-xs uppercase tracking-wider hover:bg-text-primary transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { roomId, roomName, accessKey, expiresAt } = roomData;

  const copyToClipboard = async (value, type) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      setTimeout(() => setCopied(''), 1500);
    } catch (_) {}
  };

  const downloadCredentials = () => {
    const credentials = {
      project: { roomId, roomName, expiresAt },
      access: { accessKey },
    };
    const blob = new Blob([JSON.stringify(credentials, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `handoffhub-${roomId}-credentials.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-black text-text-primary px-4">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-mint/10 border border-brand-mint/30 mb-5">
            <PackageCheck className="w-6 h-6 text-brand-mint" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">Project Created</h1>
          <p className="text-text-secondary text-sm">
            Save your project credentials before entering. The access key cannot be recovered later.
          </p>
        </div>

        {/* Credentials card */}
        <div className="bg-surface-slate border border-surface-border rounded-2xl p-6 space-y-5">

          {/* Project Name */}
          <div>
            <label className="block text-mono text-text-secondary text-xs mb-1.5">PROJECT NAME</label>
            <p className="text-text-primary text-base">{roomName}</p>
          </div>

          {/* Project ID */}
          <div>
            <label className="block text-mono text-text-secondary text-xs mb-1.5">PROJECT ID</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-lg bg-canvas-black border border-surface-border font-mono text-brand-mint text-sm tracking-widest">
                {roomId}
              </div>
              <button
                onClick={() => copyToClipboard(roomId, 'roomId')}
                className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-surface-border hover:bg-surface-elevated transition text-xs font-mono text-text-secondary hover:text-text-primary"
              >
                {copied === 'roomId' ? <Check className="w-3.5 h-3.5 text-brand-mint" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'roomId' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Access Key */}
          <div>
            <label className="block text-mono text-text-secondary text-xs mb-1.5">ACCESS KEY</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-lg bg-canvas-black border border-surface-border font-mono text-semantic-success text-sm tracking-widest break-all">
                {accessKey}
              </div>
              <button
                onClick={() => copyToClipboard(accessKey, 'accessKey')}
                className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-surface-border hover:bg-surface-elevated transition text-xs font-mono text-text-secondary hover:text-text-primary"
              >
                {copied === 'accessKey' ? <Check className="w-3.5 h-3.5 text-brand-mint" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'accessKey' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-semantic-warning/20 bg-semantic-warning/5 p-4">
            <p className="text-sm text-semantic-warning font-medium mb-1">
              Save this access key now.
            </p>
            <p className="text-xs text-text-muted">
              Only a secure hash is stored on the server. The key cannot be recovered once you leave this page. Share it with your client to grant them access.
            </p>
          </div>

          {/* Actions */}
          <button
            onClick={downloadCredentials}
            className="w-full py-3 rounded-button border border-surface-border hover:bg-surface-elevated transition font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-text-primary flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Credentials
          </button>

          <button
            onClick={() => navigate(`/room/${roomId}`, { replace: true })}
            className="w-full py-3 rounded-button bg-brand-mint hover:bg-text-primary text-canvas-black font-mono text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            I've Saved It — Enter Project
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Expiry */}
        {expiresAt && (
          <p className="mt-4 text-center text-xs text-text-muted">
            Project expires at {new Date(expiresAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default RoomCreatedPage;
