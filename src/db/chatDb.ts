import Dexie, { type Table } from 'dexie';
import type { ChatMessage, ChatChannel } from '../types/chat';

class ChatDatabase extends Dexie {
  messages!: Table<ChatMessage>;
  channels!: Table<ChatChannel>;

  constructor() {
    super('orgos_chat');
    this.version(1).stores({
      messages: 'id, channelId, parentId, senderId, createdAt',
      channels: 'id, type, sectionKey',
    });
  }
}

export const chatDb = new ChatDatabase();

export async function getMessages(channelId: string, parentId?: string): Promise<ChatMessage[]> {
  if (parentId) {
    return chatDb.messages.where('parentId').equals(parentId).sortBy('createdAt');
  }
  const all = await chatDb.messages.where('channelId').equals(channelId).sortBy('createdAt');
  return all.filter(m => !m.parentId);
}

export async function addMessage(msg: ChatMessage): Promise<void> {
  await chatDb.messages.put(msg);
}

export async function updateMessage(id: string, patch: Partial<ChatMessage>): Promise<void> {
  await chatDb.messages.update(id, patch);
}

export async function deleteMessage(id: string): Promise<void> {
  await chatDb.messages.delete(id);
}

export async function getThreadCount(parentId: string): Promise<number> {
  return chatDb.messages.where('parentId').equals(parentId).count();
}

export async function getThreadLastReply(parentId: string): Promise<ChatMessage | undefined> {
  const replies = await chatDb.messages.where('parentId').equals(parentId).sortBy('createdAt');
  return replies[replies.length - 1];
}

export async function getChannels(): Promise<ChatChannel[]> {
  return chatDb.channels.toArray();
}

export async function putChannel(ch: ChatChannel): Promise<void> {
  await chatDb.channels.put(ch);
}

export async function searchMessages(query: string): Promise<ChatMessage[]> {
  const lower = query.toLowerCase();
  return chatDb.messages
    .filter(m => m.content.toLowerCase().includes(lower))
    .sortBy('createdAt');
}
