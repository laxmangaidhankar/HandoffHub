// src/crypto/decryptData.js

import {
  base64UrlToArrayBuffer,
} from './keyManager';

/**
 * Decrypt AES-256-GCM encrypted data.
 *
 * @param {{ciphertext: string, iv: string}} payload
 * @param {CryptoKey} key
 * @param {'string' | 'buffer'} returnType
 * @returns {Promise<string | ArrayBuffer>}
 */
export const decryptData = async (
  { ciphertext, iv },
  key,
  returnType = 'string'
) => {
  if (!ciphertext || !iv) {
    throw new Error(
      'Invalid encryption payload: ciphertext and iv are required.'
    );
  }

  if (!key) {
    throw new Error('Encryption key is required.');
  }

  if (
    returnType !== 'string' &&
    returnType !== 'buffer'
  ) {
    throw new Error(
      'returnType must be "string" or "buffer".'
    );
  }

  const ciphertextBuffer =
    base64UrlToArrayBuffer(ciphertext);

  const ivBuffer =
    base64UrlToArrayBuffer(iv);

  const decryptedBuffer =
    await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
      },
      key,
      ciphertextBuffer
    );

  if (returnType === 'buffer') {
    return decryptedBuffer;
  }

  return new TextDecoder().decode(
    decryptedBuffer
  );
};