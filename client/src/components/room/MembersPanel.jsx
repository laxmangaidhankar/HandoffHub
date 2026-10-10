import React, { useState } from 'react';
import { Users, Crown, Circle, Clock, Copy, Check } from 'lucide-react';

export const MembersPanel = ({ room, members }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(room?.roomId || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  const expiresAt = room?.expiresAt ? new Date(room.expiresAt) : null;
  const now = new Date();
  const msLeft = expiresAt ? expiresAt - now : 0;
  const hoursLeft = Math.max(0, Math.floor(msLeft / 3600000));
  const minutesLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));

  return (
    <aside className="flex flex-col h-full bg-canvas-black overflow-hidden">

      {/* Header */}
      <div className="h-12 px-4 border-b border-surface-border flex items-center gap-2 bg-surface-elevated shrink-0">
        <Users className="w-4 h-4 text-brand-mint shrink-0" />
        <h3 className="text-xs font-semibold text-text-primary">
          Team
        </h3>
        <span className="ml-auto text-[10px] font-mono text-text-muted bg-surface-border px-1.5 py-0.5 rounded-full">
          {members.length}
        </span>
      </div>

      {/* Project info */}
      <div className="px-4 py-3 border-b border-surface-border bg-surface-slate/50">
        <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">Project ID</p>
        <button
          onClick={handleCopyId}
          className="flex items-center gap-2 text-sm font-mono text-text-primary hover:text-brand-mint transition-colors"
        >
          <span className="tracking-widest">{room?.roomId}</span>
          {copied ? <Check className="w-3 h-3 text-brand-mint" /> : <Copy className="w-3 h-3 text-text-muted" />}
        </button>

        {expiresAt && (
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-[10px] text-text-muted">
              {msLeft > 0
                ? `Expires in ${hoursLeft}h ${minutesLeft}m`
                : 'Expired'}
            </span>
          </div>
        )}
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-1">
          {members.map((member, idx) => (
            <div
              key={member.participantId}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-mono font-medium ${
                  idx === 0
                    ? 'bg-brand-mint/20 border-brand-mint/50 text-brand-mint'
                    : 'bg-surface-elevated border-surface-border text-text-primary'
                }`}>
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-semantic-success border border-canvas-black" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary truncate">{member.displayName}</p>
                <p className="text-[10px] text-text-muted">
                  {idx === 0 ? 'Developer' : 'Client'}
                </p>
              </div>

              {idx === 0 && (
                <Crown className="w-3 h-3 text-brand-mint shrink-0" />
              )}
            </div>
          ))}

          {members.length === 0 && (
            <p className="text-xs text-text-muted text-center py-6">
              No participants yet
            </p>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="p-4 border-t border-surface-border bg-surface-elevated">
        <p className="text-[11px] text-text-muted leading-relaxed">
          Share the project ID and access key to invite your client.
        </p>
      </div>
    </aside>
  );
};
