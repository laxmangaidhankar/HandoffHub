import { generateEncryptionKey } from "./keyManager";
import { saveKey, getKey, deleteKey } from "./indexedDb";

import { wrapRoomKey, unwrapRoomKey } from "./KeyWrap";

const getChatKeyId = (roomId) => {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  return `chat:${roomId}:encryption-key`;
};

export const createChatEncryptionKey = async (roomId) => {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  const existingKey = await getKey(getChatKeyId(roomId));

  if (existingKey) {
    return existingKey;
  }

  const chatKey = await generateEncryptionKey();

  await saveKey(getChatKeyId(roomId), chatKey);

  return chatKey;
};

export const getChatEncryptionKey = async (roomId) => {
  return await getKey(getChatKeyId(roomId));
};

export const requireChatEncryptionKey = async (roomId) => {
  const chatKey = await getChatEncryptionKey(roomId);

  if (!chatKey) {
    throw new Error(`No Chat encryption key found for room ${roomId}.`);
  }

  return chatKey;
};

export const saveChatEncryptionKey = async (roomId, chatKey) => {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  if (!chatKey) {
    throw new Error("Chat encryption key is required.");
  }

  await saveKey(getChatKeyId(roomId), chatKey);

  return true;
};

export const deleteChatEncryptionKey = async (roomId) => {
  await deleteKey(getChatKeyId(roomId));

  return true;
};

export const wrapChatEncryptionKey = async (roomId, pairwiseKey) => {
  const chatKey = await requireChatEncryptionKey(roomId);

  return wrapRoomKey(chatKey, pairwiseKey);
};

export const unwrapAndSaveChatEncryptionKey = async (
  roomId,
  wrappedKey,
  iv,
  pairwiseKey,
) => {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  if (!wrappedKey) {
    throw new Error("Wrapped Chat Key is required.");
  }

  if (!iv) {
    throw new Error("Wrapped Chat Key IV is required.");
  }

  if (!pairwiseKey) {
    throw new Error("Pairwise encryption key is required.");
  }

  const chatKey = await unwrapRoomKey(wrappedKey, iv, pairwiseKey);

  await saveChatEncryptionKey(roomId, chatKey);

  return chatKey;
};
