// src/crypto/ecdhKeyManager.js

const ECDH_ALGORITHM = 'ECDH';
const ECDH_CURVE = 'P-256';


// ----------------------------------------
// Generate ECDH Key Pair
// ----------------------------------------

export const generateECDHKeyPair = async () => {
  if (!window.crypto?.subtle) {
    throw new Error('Web Crypto API is not supported in this browser.');
  }

  return window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    false, // 🔐 private key is NOT extractable
    ['deriveBits']
  );
};


// ----------------------------------------
// Export ECDH Public Key
// ----------------------------------------

export const exportECDHPublicKey = async (
  publicKey
) => {
  if (!publicKey) {
    throw new Error(
      'ECDH public key is required.'
    );
  }

  const publicKeyBuffer =
    await window.crypto.subtle.exportKey(
      'spki',
      publicKey
    );

  return publicKeyBuffer;
};


// ----------------------------------------
// Import ECDH Public Key
// ----------------------------------------

export const importECDHPublicKey = async (
  publicKeyBuffer
) => {
  if (!publicKeyBuffer) {
    throw new Error(
      'ECDH public key data is required.'
    );
  }

  return window.crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    {
      name: ECDH_ALGORITHM,
      namedCurve: ECDH_CURVE,
    },
    true,
    []
  );
};


// ----------------------------------------
// Derive ECDH Shared Secret
// ----------------------------------------

export const deriveSharedSecret = async (
  privateKey,
  peerPublicKey
) => {
  if (!privateKey) {
    throw new Error(
      'ECDH private key is required.'
    );
  }

  if (!peerPublicKey) {
    throw new Error(
      'Peer ECDH public key is required.'
    );
  }

  return window.crypto.subtle.deriveBits(
    {
      name: ECDH_ALGORITHM,
      public: peerPublicKey,
    },
    privateKey,
    256
  );
};