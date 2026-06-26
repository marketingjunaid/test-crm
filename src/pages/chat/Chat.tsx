import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Hash, Lock, Plus, Search, Send, Paperclip, Smile, X, ChevronRight,
  Edit2, Trash2, Pin, Reply, Download, MessageSquare, Users,
  ImageIcon, FileText, File, AtSign, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUsers } from '../../store/storage';
import { resolveAccess } from '../../permissions';
import {
  getMessages, addMessage, updateMessage, deleteMessage,
  getThreadCount, getChannels, putChannel, searchMessages,
} from '../../db/chatDb';
import type { ChatMessage, ChatChannel, ChatAttachment } from '../../types/chat';
import type { AppUser } from '../../types';

// ─── Constants ──────────────────────────────────────────────────────────────

const SECTION_CHANNELS: { sectionKey: string; name: string; description: string }[] = [
  { sectionKey: 'crm', name: 'crm-team', description: 'CRM leads, contacts and deals' },
  { sectionKey: 'hr', name: 'hr-team', description: 'Human resources discussions' },
  { sectionKey: 'finance', name: 'finance', description: 'Finance and invoicing' },
  { sectionKey: 'projects', name: 'projects', description: 'Projects and task updates' },
  { sectionKey: 'inventory', name: 'inventory', description: 'Inventory and stock' },
  { sectionKey: 'support', name: 'support-team', description: 'Support tickets and knowledge base' },
];

const COMMON_EMOJI = ['👍', '❤️', '😄', '🎉', '🔥', '👀', '✅', '🚀'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function sameSender(a: ChatMessage, b: ChatMessage) {
  return a.senderId === b.senderId && Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) < 5 * 60 * 1000;
}

function fileIcon(type: ChatAttachment['type']) {
  if (type === 'image') return <ImageIcon size={14} className="text-indigo-500" />;
  if (type === 'pdf') return <FileText size={14} className="text-red-500" />;
  if (type === 'doc') return <FileText size={14} className="text-blue-500" />;
  return <File size={14} className="text-slate-400" />;
}

function getFileType(mime: string): ChatAttachment['type'] {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('word') || mime.includes('document')) return 'doc';
  return 'other';
}

function getUserInitial(name: string) {
  return name?.[0]?.toUpperCase() || '?';
}

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500',
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Typing indicator helpers (localStorage-based, cross-tab via storage event) ──

const TYPING_PREFIX = 'orgos_typing_';

function setTypingLocal(channelId: string, user: AppUser) {
  localStorage.setItem(TYPING_PREFIX + channelId, JSON.stringify({
    userId: user.id,
    userName: user.name,
    expiresAt: Date.now() + 3000,
  }));
  // Trigger storage event in other tabs by writing a dummy key
  localStorage.setItem('orgos_typing_ping', String(Date.now()));
}

function clearTypingLocal(channelId: string) {
  localStorage.removeItem(TYPING_PREFIX + channelId);
  localStorage.setItem('orgos_typing_ping', String(Date.now()));
}

function getTypingUsers(channelId: string, myId: string): string[] {
  const results: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(TYPING_PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.channelId === channelId && parsed.userId !== myId && parsed.expiresAt > Date.now()) {
        results.push(parsed.userName);
      }
    } catch { /* ignore */ }
  }
  // Also check the exact channel key format
  const raw = localStorage.getItem(TYPING_PREFIX + channelId);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.userId !== myId && parsed.expiresAt > Date.now()) {
        if (!results.includes(parsed.userName)) results.push(parsed.userName);
      }
    } catch { /* ignore */ }
  }
  return results;
}

// ─── Avatar component ────────────────────────────────────────────────────────

const Avatar: React.FC<{ name: string; id: string; size?: 'sm' | 'md' }> = ({ name, id, size = 'md' }) => (
  <div className={`${avatarColor(id)} ${size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
    {getUserInitial(name)}
  </div>
);

// ─── Typing Indicator component ───────────────────────────────────────────────

const TypingIndicator: React.FC<{ names: string[] }> = ({ names }) => {
  if (!names.length) return null;
  const label = names.length === 1 ? `${names[0]} is typing` : `${names.join(', ')} are typing`;
  return (
    <div className="flex items-center gap-2 px-4 py-1" role="status" aria-live="polite">
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            style={{ animation: 'typingBounce 0.8s infinite', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
};

// ─── Emoji Picker ────────────────────────────────────────────────────────────

const EmojiPicker: React.FC<{ onPick: (e: string) => void; onClose: () => void }> = ({ onPick, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute bottom-full right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex gap-1 z-50 animate-fadeIn">
      {COMMON_EMOJI.map(e => (
        <button key={e} onClick={() => { onPick(e); onClose(); }} className="text-lg hover:bg-slate-100 rounded-lg p-1 transition-colors">{e}</button>
      ))}
    </div>
  );
};

// ─── Message Action Bar ───────────────────────────────────────────────────────

const MessageActions: React.FC<{
  msg: ChatMessage;
  isMine: boolean;
  isAdmin: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}> = ({ msg, isMine, isAdmin, onReact, onReply, onEdit, onDelete, onPin }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  return (
    <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg shadow-md px-1 py-0.5 z-10">
      <div className="relative">
        <button onClick={() => setShowEmoji(v => !v)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" title="React">
          <Smile size={14} />
        </button>
        {showEmoji && <EmojiPicker onPick={onReact} onClose={() => setShowEmoji(false)} />}
      </div>
      {!msg.parentId && (
        <button onClick={onReply} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" title="Reply in thread">
          <Reply size={14} />
        </button>
      )}
      {(isMine || isAdmin) && (
        <>
          {isMine && (
            <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" title="Edit">
              <Edit2 size={14} />
            </button>
          )}
          <button onClick={onPin} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" title="Pin">
            <Pin size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-slate-100 rounded text-red-400 hover:text-red-600 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  );
};

// ─── Attachment preview ───────────────────────────────────────────────────────

const AttachmentDisplay: React.FC<{ att: ChatAttachment }> = ({ att }) => {
  const [lightbox, setLightbox] = useState(false);
  const download = () => {
    const a = document.createElement('a');
    a.href = att.dataUrl;
    a.download = att.name;
    a.click();
  };
  if (att.type === 'image') {
    return (
      <>
        <div className="relative group/img cursor-pointer mt-1" onClick={() => setLightbox(true)}>
          <img src={att.dataUrl} alt={att.name} className="max-w-xs max-h-48 rounded-lg object-cover border border-slate-200" />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
            <button onClick={e => { e.stopPropagation(); download(); }} className="opacity-0 group-hover/img:opacity-100 bg-white/90 rounded-lg p-1.5 transition-opacity">
              <Download size={14} className="text-slate-700" />
            </button>
          </div>
        </div>
        {lightbox && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
            <img src={att.dataUrl} alt={att.name} className="max-w-full max-h-full rounded-lg" />
          </div>
        )}
      </>
    );
  }
  return (
    <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg max-w-xs hover:bg-slate-100 transition-colors">
      {fileIcon(att.type)}
      <span className="text-xs text-slate-700 truncate flex-1">{att.name}</span>
      <span className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(0)}KB</span>
      <button onClick={download} className="text-slate-400 hover:text-indigo-600 transition-colors">
        <Download size={12} />
      </button>
    </div>
  );
};

// ─── Single Message bubble ────────────────────────────────────────────────────

const MessageBubble: React.FC<{
  msg: ChatMessage;
  grouped: boolean;
  isMine: boolean;
  isAdmin: boolean;
  threadCount: number;
  onReact: (id: string, emoji: string) => void;
  onReply: (msg: ChatMessage) => void;
  onEdit: (msg: ChatMessage) => void;
  onDelete: (id: string) => void;
  onPin: (msg: ChatMessage) => void;
}> = ({ msg, grouped, isMine, isAdmin, threadCount, onReact, onReply, onEdit, onDelete, onPin }) => (
  <div className={`group relative flex gap-2 px-4 py-0.5 hover:bg-slate-50 transition-colors ${msg.pending ? 'opacity-60' : ''} animate-messageIn`}>
    <div className="w-8 flex-shrink-0 mt-0.5">
      {!grouped && <Avatar name={msg.senderName} id={msg.senderId} />}
    </div>
    <div className="flex-1 min-w-0">
      {!grouped && (
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-sm font-semibold text-slate-900">{msg.senderName}</span>
          <span className="text-[10px] text-slate-400">{formatTime(msg.createdAt)}</span>
          {msg.edited && <span className="text-[10px] text-slate-400 italic">(edited)</span>}
        </div>
      )}
      <div className="text-sm text-slate-800 leading-relaxed break-words">
        {msg.content.split(/(@\w+)/g).map((part, i) =>
          part.startsWith('@')
            ? <span key={i} className="text-indigo-600 font-medium bg-indigo-50 rounded px-0.5">{part}</span>
            : part
        )}
      </div>
      {msg.attachments?.map(att => <AttachmentDisplay key={att.id} att={att} />)}
      {Object.entries(msg.reactions).filter(([, ids]) => ids.length > 0).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(msg.reactions).filter(([, ids]) => ids.length > 0).map(([emoji, ids]) => (
            <button
              key={emoji}
              onClick={() => onReact(msg.id, emoji)}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all reaction-pop
                ${ids.includes(isMine ? msg.senderId : '') ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              {emoji} <span>{ids.length}</span>
            </button>
          ))}
        </div>
      )}
      {threadCount > 0 && !msg.parentId && (
        <button
          onClick={() => onReply(msg)}
          className="flex items-center gap-1.5 mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
        >
          <MessageSquare size={12} />
          {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
          <ChevronRight size={12} />
        </button>
      )}
      {msg.pending && <span className="text-[10px] text-slate-400 mt-0.5 block">Sending…</span>}
      {msg.failed && (
        <div className="flex items-center gap-1 mt-0.5">
          <AlertCircle size={12} className="text-red-500" />
          <span className="text-[10px] text-red-500">Failed to send.</span>
          <button className="text-[10px] text-indigo-600 hover:underline">Retry</button>
        </div>
      )}
    </div>
    <MessageActions
      msg={msg}
      isMine={isMine}
      isAdmin={isAdmin}
      onReact={emoji => onReact(msg.id, emoji)}
      onReply={() => onReply(msg)}
      onEdit={() => onEdit(msg)}
      onDelete={() => onDelete(msg.id)}
      onPin={() => onPin(msg)}
    />
  </div>
);

// ─── Message Composer ─────────────────────────────────────────────────────────

const Composer: React.FC<{
  channelId: string;
  placeholder: string;
  onSend: (content: string, attachments: ChatAttachment[]) => void;
  editingMsg?: ChatMessage | null;
  onCancelEdit?: () => void;
  users: AppUser[];
  currentUserId: string;
}> = ({ channelId, placeholder, onSend, editingMsg, onCancelEdit, users, currentUserId }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMention, setShowMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [dragging, setDragging] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUser = users.find(u => u.id === currentUserId);

  useEffect(() => {
    if (editingMsg) { setText(editingMsg.content); textRef.current?.focus(); }
    else setText('');
  }, [editingMsg]);

  const handleTyping = () => {
    if (currentUser) setTypingLocal(channelId, currentUser);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => clearTypingLocal(channelId), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    handleTyping();
    const atIdx = val.lastIndexOf('@');
    if (atIdx >= 0 && (atIdx === val.length - 1 || /^\w*$/.test(val.slice(atIdx + 1)))) {
      setMentionQuery(val.slice(atIdx + 1));
      setShowMention(true);
    } else {
      setShowMention(false);
    }
  };

  const insertMention = (name: string) => {
    const atIdx = text.lastIndexOf('@');
    const newText = text.slice(0, atIdx) + '@' + name + ' ';
    setText(newText);
    setShowMention(false);
    textRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape' && editingMsg && onCancelEdit) onCancelEdit();
  };

  const handleSend = () => {
    const content = text.trim();
    if (!content && !attachments.length) return;
    onSend(content, attachments);
    setText('');
    setAttachments([]);
    clearTypingLocal(channelId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        setAttachments(prev => [...prev, {
          id: crypto.randomUUID(), name: file.name,
          type: getFileType(file.type), dataUrl, size: file.size, mimeType: file.type,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files));
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()) && u.id !== currentUserId);

  return (
    <div
      className={`relative px-4 pb-4 pt-2 ${dragging ? 'bg-indigo-50' : ''} transition-colors`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {dragging && (
        <div className="absolute inset-0 border-2 border-dashed border-indigo-400 rounded-xl bg-indigo-50/80 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center"><Paperclip size={24} className="text-indigo-500 mx-auto mb-1" /><p className="text-sm text-indigo-600 font-medium">Drop to attach</p></div>
        </div>
      )}
      {editingMsg && (
        <div className="flex items-center gap-2 mb-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
          <Edit2 size={12} /><span>Editing message</span>
          <button onClick={onCancelEdit} className="ml-auto text-slate-400 hover:text-slate-600"><X size={12} /></button>
        </div>
      )}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map(att => (
            <div key={att.id} className="relative group/att">
              {att.type === 'image'
                ? <img src={att.dataUrl} alt={att.name} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                : <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">{fileIcon(att.type)}{att.name}</div>
              }
              <button
                onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                className="absolute -top-1 -right-1 w-4 h-4 bg-slate-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      {showMention && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 animate-fadeIn">
          {filteredUsers.slice(0, 6).map(u => (
            <button key={u.id} onClick={() => insertMention(u.name)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-sm text-left transition-colors">
              <Avatar name={u.name} id={u.id} size="sm" />
              <span className="font-medium text-slate-800">{u.name}</span>
              <span className="text-slate-400 text-xs ml-auto">{u.role}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200 transition-all shadow-sm">
        <textarea
          ref={textRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent max-h-32 overflow-y-auto leading-relaxed py-1"
          style={{ height: 'auto' }}
          onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 128) + 'px'; }}
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="relative">
            <button onClick={() => setShowEmoji(v => !v)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Smile size={16} />
            </button>
            {showEmoji && (
              <div className="absolute bottom-full right-0 mb-1 z-20">
                <EmojiPicker onPick={e => { setText(t => t + e); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />
              </div>
            )}
          </div>
          <label className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <Paperclip size={16} />
            <input type="file" multiple className="hidden" onChange={handleFileInput} />
          </label>
          <button
            onClick={() => { setText(t => t + '@'); textRef.current?.focus(); }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <AtSign size={16} />
          </button>
          <button
            onClick={handleSend}
            disabled={!text.trim() && !attachments.length}
            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-1"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-1 ml-1">Enter to send · Shift+Enter for new line · @ to mention</p>
    </div>
  );
};

// ─── Thread Panel ─────────────────────────────────────────────────────────────

const ThreadPanel: React.FC<{
  parent: ChatMessage;
  currentUser: AppUser;
  allUsers: AppUser[];
  isAdmin: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ parent, currentUser, allUsers, isAdmin, onClose, onUpdate }) => {
  const [replies, setReplies] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await getMessages(parent.channelId, parent.id);
    setReplies(r);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [parent.id, parent.channelId]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (content: string, attachments: ChatAttachment[]) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(), channelId: parent.channelId,
      senderId: currentUser.id, senderName: currentUser.name,
      content, attachments, parentId: parent.id,
      reactions: {}, edited: false, createdAt: new Date().toISOString(),
    };
    await addMessage(msg);
    onUpdate();
    load();
  };

  const handleDelete = async (id: string) => { await deleteMessage(id); load(); onUpdate(); };

  const handleReact = async (id: string, emoji: string) => {
    const msg = replies.find(m => m.id === id);
    if (!msg) return;
    const current = msg.reactions[emoji] || [];
    const updated = current.includes(currentUser.id) ? current.filter(x => x !== currentUser.id) : [...current, currentUser.id];
    await updateMessage(id, { reactions: { ...msg.reactions, [emoji]: updated } });
    load();
  };

  return (
    <div className="flex flex-col h-full border-l border-slate-200 bg-white animate-slideIn" style={{ width: 360 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-slate-500" />
          <span className="font-semibold text-sm text-slate-900">Thread</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
      </div>
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-start gap-2">
          <Avatar name={parent.senderName} id={parent.senderId} size="sm" />
          <div>
            <p className="text-xs font-semibold text-slate-800">{parent.senderName}</p>
            <p className="text-sm text-slate-700 mt-0.5">{parent.content}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2" role="log" aria-live="polite" aria-label="Thread replies">
        {replies.map((r, i) => (
          <MessageBubble
            key={r.id} msg={r}
            grouped={i > 0 && sameSender(replies[i - 1], r)}
            isMine={r.senderId === currentUser.id}
            isAdmin={isAdmin}
            threadCount={0}
            onReact={handleReact}
            onReply={() => {}}
            onEdit={() => {}}
            onDelete={handleDelete}
            onPin={() => {}}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <Composer
        channelId={parent.channelId}
        placeholder="Reply in thread…"
        onSend={handleSend}
        users={allUsers}
        currentUserId={currentUser.id}
      />
    </div>
  );
};

// ─── Create Channel Modal ──────────────────────────────────────────────────────

const CreateChannelModal: React.FC<{
  currentUser: AppUser;
  allUsers: AppUser[];
  onClose: () => void;
  onCreate: (ch: ChatChannel) => void;
}> = ({ currentUser, allUsers, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleCreate = () => {
    if (!name.trim()) return;
    const ch: ChatChannel = {
      id: `ch-${crypto.randomUUID()}`,
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: desc.trim(),
      type: isPrivate ? 'private' : 'public',
      members: isPrivate ? [currentUser.id, ...selectedMembers] : allUsers.map(u => u.id),
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    onCreate(ch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Create Channel</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Channel name</label>
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-indigo-400">
              <Hash size={14} className="text-slate-400" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="channel-name" className="flex-1 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this channel about?" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
            <div>
              <p className="text-sm font-medium text-slate-700">Private channel</p>
              <p className="text-xs text-slate-400">Only invited members can join</p>
            </div>
          </label>
          {isPrivate && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Invite members</label>
              <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                {allUsers.filter(u => u.id !== currentUser.id).map(u => (
                  <label key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={selectedMembers.includes(u.id)} onChange={e => setSelectedMembers(prev => e.target.checked ? [...prev, u.id] : prev.filter(x => x !== u.id))} className="w-3.5 h-3.5 text-indigo-600 rounded" />
                    <Avatar name={u.name} id={u.id} size="sm" />
                    <span className="text-sm text-slate-700">{u.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim()} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors">Create</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Chat Page ───────────────────────────────────────────────────────────

export default function Chat() {
  const { channelId: urlChannelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [allUsers] = useState<AppUser[]>(getUsers());
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadParent, setThreadParent] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[] | null>(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const [unreadMap] = useState<Record<string, number>>({});
  const [showScrollPill, setShowScrollPill] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const tabId = useRef(crypto.randomUUID());
  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';

  // ── Init channels ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const init = async () => {
      const existing = await getChannels();
      const existingIds = new Set(existing.map(c => c.id));

      // General channel always exists
      if (!existingIds.has('general')) {
        await putChannel({
          id: 'general', name: 'general', description: 'General team discussion',
          type: 'public', members: allUsers.map(u => u.id),
          createdBy: 'system', createdAt: new Date().toISOString(),
        });
      }

      // Section-scoped channels for sections user can access
      const userSections = resolveAccess(currentUser);
      for (const sc of SECTION_CHANNELS) {
        if (!userSections.includes(sc.sectionKey as never)) continue;
        const id = `section-${sc.sectionKey}`;
        if (!existingIds.has(id)) {
          await putChannel({
            id, name: sc.name, description: sc.description,
            type: 'public', sectionKey: sc.sectionKey,
            members: allUsers.map(u => u.id),
            createdBy: 'system', createdAt: new Date().toISOString(),
          });
        }
      }

      // DM channels for each user
      for (const u of allUsers) {
        if (u.id === currentUser.id) continue;
        const dmId = ['dm', currentUser.id, u.id].sort().join('-');
        if (!existingIds.has(dmId)) {
          await putChannel({
            id: dmId, name: u.name, description: '',
            type: 'dm', members: [currentUser.id, u.id],
            createdBy: currentUser.id, createdAt: new Date().toISOString(),
          });
        }
      }

      const all = await getChannels();
      setChannels(all);
    };
    init();
  }, [currentUser, allUsers]);

  // ── Set active channel from URL ──────────────────────────────────────────
  useEffect(() => {
    if (urlChannelId) setActiveChannelId(urlChannelId);
  }, [urlChannelId]);

  // ── Load messages ────────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    const msgs = await getMessages(activeChannelId);
    setMessages(msgs);
    const counts: Record<string, number> = {};
    await Promise.all(msgs.map(async m => {
      counts[m.id] = await getThreadCount(m.id);
    }));
    setThreadCounts(counts);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [activeChannelId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // ── BroadcastChannel sync ────────────────────────────────────────────────
  useEffect(() => {
    const bc = new BroadcastChannel('orgos_chat');
    broadcastRef.current = bc;
    bc.onmessage = e => {
      if (e.data.sourceId === tabId.current) return;
      if (e.data.type === 'NEW_MESSAGE' || e.data.type === 'UPDATE_MESSAGE' || e.data.type === 'DELETE_MESSAGE') {
        loadMessages();
        if (e.data.type === 'NEW_MESSAGE' && e.data.channelId === activeChannelId) {
          const atBottom = scrollRef.current ? scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 100 : true;
          if (!atBottom) setNewMsgCount(n => n + 1);
        }
      }
    };
    return () => bc.close();
  }, [loadMessages, activeChannelId]);

  // ── Typing indicator polling ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      setTypingNames(getTypingUsers(activeChannelId, currentUser.id));
    }, 500);
    return () => clearInterval(interval);
  }, [activeChannelId, currentUser]);

  // ── Scroll tracking ──────────────────────────────────────────────────────
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const atBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 100;
    setShowScrollPill(!atBottom);
    if (atBottom) { setNewMsgCount(0); }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMsgCount(0);
    setShowScrollPill(false);
  };

  // ── Send / Edit message ──────────────────────────────────────────────────
  const handleSend = async (content: string, attachments: ChatAttachment[]) => {
    if (!currentUser) return;
    if (editingMsg) {
      await updateMessage(editingMsg.id, { content, edited: true, editedAt: new Date().toISOString() });
      setEditingMsg(null);
      broadcastRef.current?.postMessage({ type: 'UPDATE_MESSAGE', channelId: activeChannelId, sourceId: tabId.current });
    } else {
      const msg: ChatMessage = {
        id: crypto.randomUUID(), channelId: activeChannelId,
        senderId: currentUser.id, senderName: currentUser.name,
        content, attachments, reactions: {}, edited: false,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, { ...msg, pending: true }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
      await addMessage(msg);
      broadcastRef.current?.postMessage({ type: 'NEW_MESSAGE', channelId: activeChannelId, sourceId: tabId.current });
    }
    loadMessages();
  };

  const handleDelete = async (id: string) => {
    await deleteMessage(id);
    broadcastRef.current?.postMessage({ type: 'DELETE_MESSAGE', channelId: activeChannelId, sourceId: tabId.current });
    loadMessages();
    if (threadParent?.id === id) setThreadParent(null);
  };

  const handleReact = async (msgId: string, emoji: string) => {
    if (!currentUser) return;
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    const current = msg.reactions[emoji] || [];
    const updated = current.includes(currentUser.id) ? current.filter(x => x !== currentUser.id) : [...current, currentUser.id];
    await updateMessage(msgId, { reactions: { ...msg.reactions, [emoji]: updated } });
    broadcastRef.current?.postMessage({ type: 'UPDATE_MESSAGE', channelId: activeChannelId, sourceId: tabId.current });
    loadMessages();
  };

  const handlePin = async (msg: ChatMessage) => {
    await updateMessage(msg.id, {});
    loadMessages();
  };

  const handleCreateChannel = async (ch: ChatChannel) => {
    await putChannel(ch);
    setChannels(await getChannels());
    setShowCreateChannel(false);
    navigate(`/chat/${ch.id}`);
  };

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearch = async (q: string) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults(null); return; }
    const results = await searchMessages(q);
    setSearchResults(results);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeChannel = channels.find(c => c.id === activeChannelId);
  const publicChannels = channels.filter(c => c.type === 'public' && (!c.sectionKey || resolveAccess(currentUser!).includes(c.sectionKey as never)));
  const dmChannels = channels.filter(c => c.type === 'dm' && c.members.includes(currentUser?.id || ''));
  const dmOtherUser = (ch: ChatChannel) => allUsers.find(u => u.id !== currentUser?.id && ch.members.includes(u.id));

  const switchChannel = (id: string) => {
    setActiveChannelId(id);
    setThreadParent(null);
    setEditingMsg(null);
    setSearchResults(null);
    setSearch('');
    navigate(`/chat/${id}`);
  };

  // Group messages by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach(m => {
    const last = grouped[grouped.length - 1];
    if (!last || !sameDay(last.msgs[0].createdAt, m.createdAt)) {
      grouped.push({ date: formatDate(m.createdAt), msgs: [m] });
    } else {
      last.msgs.push(m);
    }
  });

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ── Channels sidebar ─────────────────────────────────────── */}
      <div className="w-60 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="px-3 py-4 border-b border-slate-800">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search messages…"
              className="w-full bg-slate-800 text-slate-300 placeholder-slate-500 text-xs rounded-lg pl-7 pr-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 sidebar-scroll">
          {/* Channels */}
          <div className="px-3 mb-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Channels</p>
              {isAdmin && (
                <button onClick={() => setShowCreateChannel(true)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <Plus size={13} />
                </button>
              )}
            </div>
          </div>
          {publicChannels.map(ch => (
            <button
              key={ch.id}
              onClick={() => switchChannel(ch.id)}
              className={`w-full flex items-center gap-1.5 px-3 py-1 text-sm transition-colors rounded-lg mx-1
                ${activeChannelId === ch.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              {ch.type === 'private' ? <Lock size={12} className="flex-shrink-0" /> : <Hash size={12} className="flex-shrink-0" />}
              <span className="truncate">{ch.name}</span>
              {unreadMap[ch.id] > 0 && (
                <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold px-1.5 rounded-full">{unreadMap[ch.id]}</span>
              )}
            </button>
          ))}

          {/* DMs */}
          <div className="px-3 mt-4 mb-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Direct Messages</p>
          </div>
          {dmChannels.map(ch => {
            const other = dmOtherUser(ch);
            if (!other) return null;
            return (
              <button
                key={ch.id}
                onClick={() => switchChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors rounded-lg mx-1
                  ${activeChannelId === ch.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <div className={`w-5 h-5 ${avatarColor(other.id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                  {getUserInitial(other.name)}
                </div>
                <span className="truncate">{other.name}</span>
                <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" title="Online" />
              </button>
            );
          })}
        </div>

        {/* Current user */}
        <div className="px-3 py-2.5 border-t border-slate-800 flex items-center gap-2">
          <Avatar name={currentUser.name} id={currentUser.id} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex flex-1 min-w-0">
        {/* Message area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Channel header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
            {activeChannel?.type === 'dm' ? (
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 ${avatarColor(dmOtherUser(activeChannel)?.id || '')} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {getUserInitial(dmOtherUser(activeChannel)?.name || '')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{dmOtherUser(activeChannel)?.name}</p>
                  <p className="text-xs text-emerald-500">Online</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {activeChannel?.type === 'private' ? <Lock size={16} className="text-slate-400" /> : <Hash size={16} className="text-slate-400" />}
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activeChannel?.name || 'general'}</p>
                  {activeChannel?.description && <p className="text-xs text-slate-400">{activeChannel.description}</p>}
                </div>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
              <Users size={14} />
              <span>{activeChannel?.members.length || 0} members</span>
            </div>
          </div>

          {/* Search results overlay */}
          {searchResults !== null && (
            <div className="absolute inset-0 z-30 bg-white flex flex-col" style={{ left: 240 }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
                <Search size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">{searchResults.length} results for "<b>{search}</b>"</span>
                <button onClick={() => { setSearchResults(null); setSearch(''); }} className="ml-auto text-slate-400 hover:text-slate-700"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {searchResults.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { switchChannel(m.channelId); setSearchResults(null); setSearch(''); }}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <Avatar name={m.senderName} id={m.senderId} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700">{m.senderName} <span className="text-slate-400 font-normal">in #{channels.find(c => c.id === m.channelId)?.name}</span></p>
                      <p className="text-sm text-slate-600 truncate">{m.content}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(m.createdAt)}</p>
                    </div>
                  </button>
                ))}
                {searchResults.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Search size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No messages found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto py-4"
            role="log"
            aria-live="polite"
            aria-label={`Messages in ${activeChannel?.name || 'general'}`}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Hash size={40} className="mb-3 opacity-20" />
                <p className="font-medium text-slate-500">Welcome to #{activeChannel?.name || 'general'}</p>
                <p className="text-sm mt-1">{activeChannel?.description || 'This is the beginning of this channel.'}</p>
              </div>
            )}
            {grouped.map(({ date, msgs: dayMsgs }) => (
              <div key={date}>
                <div className="flex items-center gap-3 px-4 my-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] font-medium text-slate-400 bg-white px-2">{date}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                {dayMsgs.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    grouped={i > 0 && sameSender(dayMsgs[i - 1], msg)}
                    isMine={msg.senderId === currentUser.id}
                    isAdmin={isAdmin}
                    threadCount={threadCounts[msg.id] || 0}
                    onReact={handleReact}
                    onReply={setThreadParent}
                    onEdit={setEditingMsg}
                    onDelete={handleDelete}
                    onPin={handlePin}
                  />
                ))}
              </div>
            ))}
            <TypingIndicator names={typingNames} />
            <div ref={bottomRef} />
          </div>

          {/* Scroll to bottom pill */}
          {showScrollPill && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={scrollToBottom}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-full shadow-lg hover:bg-indigo-700 transition-colors animate-fadeIn"
              >
                ↓ {newMsgCount > 0 ? `${newMsgCount} new message${newMsgCount > 1 ? 's' : ''}` : 'Scroll to latest'}
              </button>
            </div>
          )}

          {/* Composer */}
          <Composer
            channelId={activeChannelId}
            placeholder={activeChannel?.type === 'dm' ? `Message ${dmOtherUser(activeChannel!)?.name || ''}` : `Message #${activeChannel?.name || 'general'}`}
            onSend={handleSend}
            editingMsg={editingMsg}
            onCancelEdit={() => setEditingMsg(null)}
            users={allUsers}
            currentUserId={currentUser.id}
          />
        </div>

        {/* Thread panel */}
        {threadParent && (
          <ThreadPanel
            parent={threadParent}
            currentUser={currentUser}
            allUsers={allUsers}
            isAdmin={isAdmin}
            onClose={() => setThreadParent(null)}
            onUpdate={loadMessages}
          />
        )}
      </div>

      {showCreateChannel && (
        <CreateChannelModal
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setShowCreateChannel(false)}
          onCreate={handleCreateChannel}
        />
      )}
    </div>
  );
}
