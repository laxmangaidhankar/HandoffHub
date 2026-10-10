// src/crypto/keyWrap.js

import {
  exportKeyToString,
  importKeyFromString,
  arrayBufferToBase64Url,
  base64UrlToArrayBuffer,
} from './keyManager';


import {requireChatEncryptionKey, saveChatEncryptionKey} from './chatKeyManager';



// ----------------------------------------
// Wrap Room AES Key
// ----------------------------------------

export const wrapRoomKey = async (
  roomKey,
  pairwiseKey
) => {
  if (!roomKey) {
    throw new Error(
      'Room encryption key is required.'
    );
  }

  if (!pairwiseKey) {
    throw new Error(
      'Pairwise encryption key is required.'
    );
  }

  // Export Room AES key to raw bytes
  const roomKeyString =
    await exportKeyToString(roomKey);

  

  const roomKeyBytes =
    base64UrlToArrayBuffer(roomKeyString);

  // Generate fresh IV for wrapping
  const iv =
    window.crypto.getRandomValues(
      new Uint8Array(12)
    );

  // Encrypt Room AES key using pairwise key
  const encryptedBuffer =
    await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      pairwiseKey,
      roomKeyBytes
    );

  return {
    wrappedKey:
      arrayBufferToBase64Url(
        encryptedBuffer
      ),

    iv:
      arrayBufferToBase64Url(iv),
  };
};


export const wrapChatEncryptionKey = async (
  roomId,
  pairwiseKey
) => {
  const chatKey =
    await requireChatEncryptionKey(roomId);

  return wrapRoomKey(
    chatKey,
    pairwiseKey
  );
};

export const unwrapAndSaveChatEncryptionKey =
  async (
    roomId,
    wrappedKey,
    iv,
    pairwiseKey
  ) => {
    const chatKey =
      await unwrapRoomKey(
        wrappedKey,
        iv,
        pairwiseKey
      );

    await saveChatEncryptionKey(
      roomId,
      chatKey
    );

    return chatKey;
  };



// ----------------------------------------
// Unwrap Room AES Key
// ----------------------------------------

export const unwrapRoomKey = async (
  wrappedKey,
  iv,
  pairwiseKey
) => {
  if (!wrappedKey || !iv) {
    throw new Error(
      'Wrapped room key and IV are required.'
    );
  }

  if (!pairwiseKey) {
    throw new Error(
      'Pairwise encryption key is required.'
    );
  }

  const wrappedKeyBuffer =
    base64UrlToArrayBuffer(
      wrappedKey
    );

  const ivBuffer =
    base64UrlToArrayBuffer(iv);

  // Decrypt the Room AES key
  const roomKeyBuffer =
    await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
      },
      pairwiseKey,
      wrappedKeyBuffer
    );

  // Convert decrypted bytes back to AES CryptoKey
  return window.crypto.subtle.importKey(
    'raw',
    roomKeyBuffer,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};