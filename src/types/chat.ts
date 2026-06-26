export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'other';
  dataUrl: string;
  size: number;
  mimeType: string;
}

export interface ChatReaction {
  emoji: string;
  userIds: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments: ChatAttachment[];
  parentId?: string;
  reactions: Record<string, string[]>;
  edited: boolean;
  editedAt?: string;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'dm';
  sectionKey?: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  archived?: boolean;
}

export interface TypingState {
  userId: string;
  userName: string;
  channelId: string;
  expiresAt: number;
}
