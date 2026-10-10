import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  FolderKanban, Flag, Link2, ShieldCheck, MessageSquare,
  Users, Menu, X, ChevronLeft,
} from 'lucide-react';

import config from '../config/env';
import {
  getChatEncryptionKey,
  requireChatEncryptionKey,
  wrapChatEncryptionKey,
  unwrapAndSaveChatEncryptionKey,
} from '../crypto/chatKeyManager';
import { encryptData } from '../crypto/encryptData';
import { decryptData } from '../crypto/decryptData';
import {
  getRoomEncryptionKey,
  wrapRoomEncryptionKey,
  unwrapAndSaveRoomEncryptionKey,
  getOrCreateIdentity,
} from '../crypto/roomKeyManager';
import { Header } from './Header';
import { ChatPanel } from '../components/room/ChatPanel';
import { EnvFilesPanel } from '../components/room/EnvFilesPanel';
import { MembersPanel } from '../components/room/MembersPanel';
import { OverviewPanel } from '../components/room/OverviewPanel';
import { DeliverablesPanel } from '../components/room/DeliverablesPanel';
import { MilestonesPanel } from '../components/room/MilestonesPanel';
import { roomApi } from '../services/roomApi';
import RoomNotFound from '../pages/RoomNotFound';
import {
  exportECDHPublicKey,
  importECDHPublicKey,
  deriveSharedSecret,
} from '../crypto/ecdhKeyManager';
import { arrayBufferToBase64Url, base64UrlToArrayBuffer } from '../crypto/keyManager';
import { derivePairwiseKey } from '../crypto/keyDerivation';

// ─── Tab definitions ──────────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: 'Overview',      icon: FolderKanban },
  { id: 'milestones',   label: 'Milestones',    icon: Flag },
  { id: 'deliverables', label: 'Deliverables',  icon: Link2 },
  { id: 'credentials',  label: 'Credentials',   icon: ShieldCheck },
];

// ─── RoomLayout ───────────────────────────────────────────────────
const RoomLayout = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Crypto refs
  const pendingChatKeyRequestsRef = useRef(new Map());
  const socketRef = useRef(null);
  const pairwiseKeysRef = useRef(new Map());
  const pendingRoomKeyRequestsRef = useRef(new Map());

  // State
  const [roomKeyReady, setRoomKeyReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [members, setMembers] = useState([]);
  const [envVersion, setEnvVersion] = useState(0);
  const [messages, setMessages] = useState([]);
  const [participantPublicKeys, setParticipantPublicKeys] = useState({});

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  // ── Crypto helpers ───────────────────────────────────────────────

  const requestRoomKeyIfNeeded = async (socket) => {
    try {
      const existingRoomKey = await getRoomEncryptionKey(roomId);
      if (existingRoomKey) { setRoomKeyReady(true); return; }
      socket.emit('room:key:request');
    } catch (_) {}
  };

  const derivePairwiseKeyForParticipant = async (participantId, publicKeyString) => {
    try {
      const identity = await getOrCreateIdentity();
      const publicKeyBuffer = base64UrlToArrayBuffer(publicKeyString);
      const peerPublicKey = await importECDHPublicKey(publicKeyBuffer);
      const sharedSecret = await deriveSharedSecret(identity.privateKey, peerPublicKey);
      const pairwiseKey = await derivePairwiseKey(sharedSecret);
      pairwiseKeysRef.current.set(participantId, pairwiseKey);
      return pairwiseKey;
    } catch (_) { return null; }
  };

  const shareRoomKeyWithParticipant = async (socket, participantId) => {
    try {
      const roomKey = await getRoomEncryptionKey(roomId);
      if (!roomKey) return;
      const pairwiseKey = pairwiseKeysRef.current.get(participantId);
      if (!pairwiseKey) return;
      const wrapped = await wrapRoomEncryptionKey(roomId, pairwiseKey);
      socket.emit('room:key:share', {
        recipientParticipantId: participantId,
        wrappedKey: wrapped.wrappedKey,
        iv: wrapped.iv,
      });
      pendingRoomKeyRequestsRef.current.delete(participantId);
    } catch (_) {}
  };

  const shareChatKeyWithParticipant = async (socket, participantId) => {
    try {
      const chatKey = await requireChatEncryptionKey(roomId);
      if (!chatKey) return;
      const pairwiseKey = pairwiseKeysRef.current.get(participantId);
      if (!pairwiseKey) return;
      const wrapped = await wrapChatEncryptionKey(roomId, pairwiseKey);
      socket.emit('chat:key:share', {
        recipientParticipantId: participantId,
        wrappedKey: wrapped.wrappedKey,
        iv: wrapped.iv,
      });
    } catch (_) {}
  };

  const requestChatKeyIfNeeded = async (socket) => {
    try {
      const existingChatKey = await getChatEncryptionKey(roomId);
      if (existingChatKey) return;
      socket.emit('chat:key:request');
    } catch (_) {}
  };

  const sendMessage = async (message) => {
    try {
      const socket = socketRef.current;
      if (!socket) throw new Error('Socket not ready.');
      const trimmedMessage = message.trim();
      if (!trimmedMessage) return;
      const chatKey = await requireChatEncryptionKey(roomId);
      const encryptedMessage = await encryptData(trimmedMessage, chatKey);
      socket.emit('chat:send', { ciphertext: encryptedMessage.ciphertext, iv: encryptedMessage.iv });
    } catch (error) {
      throw error;
    }
  };

  // ── Load room ───────────────────────────────────────────────────

  useEffect(() => {
    const checkRoom = async () => {
      try {
        const statusResponse = await roomApi.getRoomStatus(roomId);
        if (!statusResponse.success || !statusResponse.room) { setNotFound(true); return; }
        const response = await roomApi.getRoom(roomId);
        if (!response.success || !response.room) {
          navigate(`/join/${roomId}`, { replace: true });
          return;
        }
        setRoom(response.room);
      } catch (error) {
        const status = error.response?.status;
        if (status === 404) setNotFound(true);
        else if (status === 401 || status === 403) navigate(`/join/${roomId}`, { replace: true });
        else setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    checkRoom();
  }, [roomId, navigate]);

  // ── Socket setup ────────────────────────────────────────────────

  useEffect(() => {
    if (!room) return;

    const socket = io(config.apiBaseUrl, { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', async () => {
      socket.emit('join-room');
      try {
        const identity = await getOrCreateIdentity();
        const publicKeyBuffer = await exportECDHPublicKey(identity.publicKey);
        const publicKey = arrayBufferToBase64Url(publicKeyBuffer);
        socket.emit('key:publish', { publicKey });
      } catch (_) {}
    });

    socket.on('room:key:request', async (data) => {
      try {
        const pairwiseKey = pairwiseKeysRef.current.get(data.participantId);
        if (!pairwiseKey) {
          pendingRoomKeyRequestsRef.current.set(data.participantId, true);
          return;
        }
        await shareRoomKeyWithParticipant(socket, data.participantId);
      } catch (_) {}
    });

    socket.on('chat:key:request', async (data) => {
      try {
        const pairwiseKey = pairwiseKeysRef.current.get(data.participantId);
        if (!pairwiseKey) {
          pendingChatKeyRequestsRef.current.set(data.participantId, true);
          return;
        }
        await shareChatKeyWithParticipant(socket, data.participantId);
      } catch (_) {}
    });

    socket.on('chat:key:share', async (data) => {
      try {
        if (data.recipientParticipantId !== room.participantId) return;
        const pairwiseKey = pairwiseKeysRef.current.get(data.senderParticipantId);
        if (!pairwiseKey) return;
        await unwrapAndSaveChatEncryptionKey(roomId, data.wrappedKey, data.iv, pairwiseKey);
      } catch (_) {}
    });

    socket.on('room:key:share', async (data) => {
      try {
        if (data.recipientParticipantId !== room.participantId) return;
        const pairwiseKey = pairwiseKeysRef.current.get(data.senderParticipantId);
        if (!pairwiseKey) return;
        await unwrapAndSaveRoomEncryptionKey(roomId, data.wrappedKey, data.iv, pairwiseKey);
        setRoomKeyReady(true);
      } catch (_) {}
    });

    socket.on('room:members', (data) => setMembers(data.participants));

    socket.on('env:updated', (data) => {
      if (data.roomId !== roomId) return;
      if (data.updatedBy === room.participantId) return;
      setEnvVersion((prev) => prev + 1);
    });

    socket.on('key:existing-participants', async (data) => {
      try {
        const keyMap = {};
        for (const participant of data.participants) {
          keyMap[participant.participantId] = {
            displayName: participant.displayName,
            publicKey: participant.publicKey,
          };
          await derivePairwiseKeyForParticipant(participant.participantId, participant.publicKey);
        }
        setParticipantPublicKeys(keyMap);
        await requestRoomKeyIfNeeded(socket);
        await requestChatKeyIfNeeded(socket);
      } catch (_) {}
    });

    socket.on('key:participant-public', async (data) => {
      setParticipantPublicKeys((prev) => ({
        ...prev,
        [data.participantId]: { displayName: data.displayName, publicKey: data.publicKey },
      }));
      const pairwiseKey = await derivePairwiseKeyForParticipant(data.participantId, data.publicKey);
      if (!pairwiseKey) return;

      if (pendingRoomKeyRequestsRef.current.has(data.participantId)) {
        await shareRoomKeyWithParticipant(socket, data.participantId);
      }
      if (pendingChatKeyRequestsRef.current.has(data.participantId)) {
        await shareChatKeyWithParticipant(socket, data.participantId);
        pendingChatKeyRequestsRef.current.delete(data.participantId);
      }

      await requestRoomKeyIfNeeded(socket);
      await requestChatKeyIfNeeded(socket);
    });

    socket.on('chat:message', async (encryptedMessage) => {
      try {
        const chatKey = await requireChatEncryptionKey(roomId);
        const decryptedMessage = await decryptData(
          { ciphertext: encryptedMessage.ciphertext, iv: encryptedMessage.iv },
          chatKey
        );
        setMessages((prev) => [
          ...prev,
          {
            messageId: encryptedMessage.messageId,
            participantId: encryptedMessage.participantId,
            displayName: encryptedMessage.displayName,
            message: decryptedMessage,
            timestamp: encryptedMessage.timestamp,
          },
        ]);
      } catch (_) {}
    });

    return () => {
      socket.emit('leave-room');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [room]);

  // ── Render ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-canvas-black text-text-primary">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-mint border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Loading project...</p>
        </div>
      </div>
    );
  }

  if (notFound) return <RoomNotFound />;
  if (!room) return null;

  const ActivePanel = () => {
    const props = { room, roomKeyReady, envVersion };
    switch (activeTab) {
      case 'overview':     return <OverviewPanel {...props} />;
      case 'milestones':   return <MilestonesPanel {...props} />;
      case 'deliverables': return <DeliverablesPanel {...props} />;
      case 'credentials':  return <EnvFilesPanel {...props} />;
      default:             return <OverviewPanel {...props} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-canvas-black text-text-primary">

      {/* Top Header */}
      <Header room={room} />

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 w-full relative">

        {/* ── LEFT SIDEBAR: Navigation tabs ─────────────────────── */}
        <nav className="hidden md:flex flex-col w-52 shrink-0 bg-surface-slate border-r border-surface-border">
          {/* Section label */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Project</p>
          </div>

          {/* Tab items */}
          <div className="flex flex-col gap-0.5 px-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                    isActive
                      ? 'bg-brand-mint/10 text-brand-mint border border-brand-mint/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mt-auto">
            <div className="border-t border-surface-border mx-4 my-3" />
            <div className="px-4 pb-2">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Communication</p>
            </div>
            <div className="flex flex-col gap-0.5 px-2 pb-4">
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors text-text-secondary hover:text-text-primary hover:bg-surface-elevated relative"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                Discussion
                {messages.length > 0 && (
                  <span className="ml-auto text-[10px] font-mono text-brand-mint bg-brand-mint/10 border border-brand-mint/20 px-1.5 py-0.5 rounded-full">
                    {messages.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTeamOpen(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
              >
                <Users className="w-4 h-4 shrink-0" />
                Team
                <span className="ml-auto text-[10px] font-mono text-text-muted bg-surface-border px-1.5 py-0.5 rounded-full">
                  {members.length}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* ── MAIN CONTENT AREA ─────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">

          {/* Mobile tab bar */}
          <div className="md:hidden flex items-center gap-1 px-3 py-2 border-b border-surface-border bg-surface-slate overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-brand-mint/10 text-brand-mint border border-brand-mint/20'
                      : 'text-text-muted hover:text-text-primary border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
            {/* Mobile chat button */}
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-mono uppercase tracking-wider whitespace-nowrap text-text-muted hover:text-text-primary border border-transparent transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 min-h-0 overflow-hidden bg-canvas-black">
            <ActivePanel />
          </div>
        </div>

        {/* ── RIGHT SIDE PANELS (slide-over on mobile, fixed on desktop) ── */}

        {/* Chat panel — slide-over on all sizes, can be toggled */}
        <>
          {/* Backdrop */}
          {chatOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setChatOpen(false)}
            />
          )}
          <aside
            className={`fixed right-0 top-0 bottom-0 z-40 flex flex-col bg-canvas-black border-l border-surface-border transition-transform duration-300 w-80 md:w-96 ${
              chatOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Close bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-elevated shrink-0">
              <span className="text-xs font-semibold text-text-primary">Discussion</span>
              <button onClick={() => setChatOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatPanel
                messages={messages}
                onSendMessage={sendMessage}
                currentParticipantId={room.participantId}
              />
            </div>
          </aside>
        </>

        {/* Team panel — slide-over */}
        <>
          {teamOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setTeamOpen(false)}
            />
          )}
          <aside
            className={`fixed right-0 top-0 bottom-0 z-40 flex flex-col bg-canvas-black border-l border-surface-border transition-transform duration-300 w-72 ${
              teamOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-elevated shrink-0">
              <span className="text-xs font-semibold text-text-primary">Team</span>
              <button onClick={() => setTeamOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <MembersPanel room={room} members={members} />
            </div>
          </aside>
        </>

      </div>

      {/* Mobile bottom bar: discussion + team quick access */}
      <div className="md:hidden flex items-center justify-end gap-2 px-4 py-2 border-t border-surface-border bg-surface-elevated">
        <button
          onClick={() => setTeamOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs text-text-secondary hover:text-text-primary border border-surface-border hover:border-brand-mint/50 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          Team ({members.length})
        </button>
        <button
          onClick={() => setChatOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs text-text-secondary hover:text-text-primary border border-surface-border hover:border-brand-mint/50 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>
      </div>

    </div>
  );
};

export default RoomLayout;
