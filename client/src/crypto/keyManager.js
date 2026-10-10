// src/crypto/keyManager.js

// ----------------------------------------
// Base64URL Helpers
// ----------------------------------------

export const arrayBufferToBase64Url = (buffer) => {
  const bytes = new Uint8Array(buffer);

  let binary = '';

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = btoa(binary);

  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const base64UrlToArrayBuffer = (base64Url) => {
  let base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};


// ----------------------------------------
// Generate AES-256-GCM Key
// ----------------------------------------

export const generateEncryptionKey = async () => {
  if (!window.crypto?.subtle) {
    throw new Error(
      'Web Crypto API is not supported in this browser.'
    );
  }

  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};


// ----------------------------------------
// Export CryptoKey
// ----------------------------------------

export const exportKeyToString = async (key) => {
  if (!key) {
    throw new Error('Encryption key is required.');
  }

  const rawKeyBuffer =
    await window.crypto.subtle.exportKey(
      'raw',
      key
    );

  return arrayBufferToBase64Url(rawKeyBuffer);
};


// ----------------------------------------
// Import CryptoKey
// ----------------------------------------

export const importKeyFromString = async (keyString) => {
  if (!keyString) {
    throw new Error(
      'Key string is empty or invalid.'
    );
  }

  const rawKeyBuffer =
    base64UrlToArrayBuffer(keyString.trim());

  return window.crypto.subtle.importKey(
    'raw',
    rawKeyBuffer,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
};