import React, { useEffect, useRef, useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export const ChatPanel = ({ messages, onSendMessage, currentParticipantId }) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isSending) return;
    try {
      setIsSending(true);
      await onSendMessage(trimmedMessage);
      setInputValue('');
    } catch (error) {
      console.error('[Chat] Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-canvas-black overflow-hidden">

      {/* Header */}
      <div className="h-12 px-4 border-b border-surface-border flex items-center gap-2 bg-surface-elevated shrink-0">
        <MessageSquare className="w-4 h-4 text-brand-mint shrink-0" />
        <div>
          <h3 className="text-xs font-semibold text-text-primary">Discussion</h3>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] font-mono text-text-muted bg-brand-mint/10 border border-brand-mint/20 px-1.5 py-0.5 rounded-full text-brand-mint">E2EE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center px-4 py-12">
            <div>
              <MessageSquare className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm text-text-primary mb-1">No messages yet</p>
              <p className="text-xs text-text-muted">
                Discuss requirements, share updates, and post feedback here.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.participantId === currentParticipantId;
          return (
            <div
              key={msg.messageId}
              className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                  <span className="text-[10px] text-brand-mint font-mono mb-1">{msg.displayName}</span>
                )}
                {isOwn && (
                  <span className="text-[10px] text-text-muted font-mono mb-1">You</span>
                )}
                <div
                  className={`px-3 py-2 text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-brand-mint text-canvas-black rounded-[14px_14px_4px_14px]'
                      : 'bg-surface-elevated text-text-primary border border-surface-border rounded-[14px_14px_14px_4px]'
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-text-muted mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-border bg-surface-elevated px-3 pb-3 pt-2">
        <p className="text-[10px] text-text-muted text-center mb-2">
          Messages are end-to-end encrypted and not persisted.
        </p>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Write a message or update..."
            disabled={isSending}
            className="w-full bg-canvas-black border border-surface-border rounded-button py-2.5 pl-3 pr-10 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="absolute right-2 p-1.5 text-text-secondary hover:text-brand-mint disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
