// src/crypto/keyDerivation.js

const HKDF_ALGORITHM = 'HKDF';
const HASH_ALGORITHM = 'SHA-256';

const PAIRWISE_KEY_INFO =
  'safehouse-pairwise-key-v1';


// ----------------------------------------
// Derive Pairwise AES Key from ECDH Secret
// ----------------------------------------

export const derivePairwiseKey = async (
  sharedSecret
) => {
  if (!sharedSecret) {
    throw new Error(
      'ECDH shared secret is required.'
    );
  }

  const sharedSecretKey =
    await window.crypto.subtle.importKey(
      'raw',
      sharedSecret,
      {
        name: HKDF_ALGORITHM,
      },
      false,
      ['deriveKey']
    );

  const infoBytes =
    new TextEncoder().encode(
      PAIRWISE_KEY_INFO
    );

  // No room-specific salt is required.
  // The ECDH shared secret is the secret input.
  const salt = new Uint8Array(0);

  return window.crypto.subtle.deriveKey(
    {
      name: HKDF_ALGORITHM,
      hash: HASH_ALGORITHM,
      salt,
      info: infoBytes,
    },
    sharedSecretKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
};