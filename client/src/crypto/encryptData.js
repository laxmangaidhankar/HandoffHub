// src/crypto/encryptData.js

import {
  arrayBufferToBase64Url,
} from './keyManager';

/**
 * Encrypt text or binary data using AES-256-GCM.
 *
 * @param {string | ArrayBuffer | Uint8Array} data
 * @param {CryptoKey} key
 * @returns {Promise<{ciphertext: string, iv: string}>}
 */
export const encryptData = async (data, key) => {
  if (data === undefined || data === null) {
    throw new Error('No data provided to encrypt.');
  }

  if (!key) {
    throw new Error('Encryption key is required.');
  }

  let dataBuffer;

  if (typeof data === 'string') {
    dataBuffer = new TextEncoder().encode(data);
  } else if (data instanceof ArrayBuffer) {
    dataBuffer = data;
  } else if (data instanceof Uint8Array) {
    dataBuffer = data;
  } else {
    throw new Error(
      'Unsupported data format for encryption.'
    );
  }

  // AES-GCM commonly uses a 96-bit (12-byte) IV.
  // A new IV is generated for every encryption.
  const iv = window.crypto.getRandomValues(
    new Uint8Array(12)
  );

  const encryptedBuffer =
    await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      dataBuffer
    );

  return {
    ciphertext:
      arrayBufferToBase64Url(encryptedBuffer),

    iv:
      arrayBufferToBase64Url(iv),
  };
};