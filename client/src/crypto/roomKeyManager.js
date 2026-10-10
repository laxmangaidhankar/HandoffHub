import {
  generateECDHKeyPair,
} from './ecdhKeyManager';

import {
  generateEncryptionKey,
} from './keyManager';

import {
  saveKey,
  getKey,
  deleteKey,
} from './indexedDb';

import {
  wrapRoomKey,
  unwrapRoomKey,
} from './KeyWrap';


// ============================================================
// STORAGE KEY HELPERS
// ============================================================

const IDENTITY_PRIVATE_KEY_ID =
  'identity:ecdh-private';

const IDENTITY_PUBLIC_KEY_ID =
  'identity:ecdh-public';

const getRoomKeyId = (roomId) => {
  if (!roomId) {
    throw new Error('Room ID is required.');
  }

  return `room:${roomId}:encryption-key`;
};


// ============================================================
// ECDH IDENTITY
// ============================================================

/**
 * Create the browser's ECDH identity.
 *
 * This identity belongs to the browser/user,
 * not to a particular room.
 */
export const createIdentity = async () => {
  const existingPrivateKey =
    await getKey(IDENTITY_PRIVATE_KEY_ID);

  const existingPublicKey =
    await getKey(IDENTITY_PUBLIC_KEY_ID);

  // Identity already exists.
  if (existingPrivateKey && existingPublicKey) {
    return {
      privateKey: existingPrivateKey,
      publicKey: existingPublicKey,
      created: false,
    };
  }

  // Generate a new identity.
  const keyPair =
    await generateECDHKeyPair();

  // Store both keys locally.
  await saveKey(
    IDENTITY_PRIVATE_KEY_ID,
    keyPair.privateKey
  );

  await saveKey(
    IDENTITY_PUBLIC_KEY_ID,
    keyPair.publicKey
  );

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    created: true,
  };
};


// ============================================================
// LOAD EXISTING ECDH IDENTITY
// ============================================================

export const getIdentity = async () => {
  const privateKey =
    await getKey(IDENTITY_PRIVATE_KEY_ID);

  const publicKey =
    await getKey(IDENTITY_PUBLIC_KEY_ID);

  if (!privateKey || !publicKey) {
    return null;
  }

  return {
    privateKey,
    publicKey,
  };
};


// ============================================================
// GET OR CREATE ECDH IDENTITY
// ============================================================

export const getOrCreateIdentity = async () => {
  const existingIdentity =
    await getIdentity();

  if (existingIdentity) {
    return existingIdentity;
  }

  return createIdentity();
};


// ============================================================
// ROOM AES KEY
// ============================================================

/**
 * Generate a new Room AES-256-GCM key.
 *
 * This should normally be called ONLY by the
 * room creator.
 */
export const createRoomEncryptionKey = async (
  roomId
) => {
  if (!roomId) {
    throw new Error('Room ID is required.');
  }

  const existingRoomKey =
    await getKey(getRoomKeyId(roomId));

  if (existingRoomKey) {
    throw new Error(
      `Room encryption key already exists for room ${roomId}.`
    );
  }

  const roomKey =
    await generateEncryptionKey();

  await saveKey(
    getRoomKeyId(roomId),
    roomKey
  );

  return roomKey;
};


// ============================================================
// GET ROOM AES KEY
// ============================================================

export const getRoomEncryptionKey = async (
  roomId
) => {
  const roomKey =
    await getKey(getRoomKeyId(roomId));

  return roomKey;
};


// ============================================================
// REQUIRE ROOM AES KEY
// ============================================================

export const requireRoomEncryptionKey = async (
  roomId
) => {
  const roomKey =
    await getRoomEncryptionKey(roomId);

  if (!roomKey) {
    throw new Error(
      `No encryption key found for room ${roomId}.`
    );
  }

  return roomKey;
};


// ============================================================
// SAVE ROOM AES KEY
// ============================================================

export const saveRoomEncryptionKey = async (
  roomId,
  roomKey
) => {
  if (!roomId) {
    throw new Error('Room ID is required.');
  }

  if (!roomKey) {
    throw new Error(
      'Room encryption key is required.'
    );
  }

  await saveKey(
    getRoomKeyId(roomId),
    roomKey
  );

  return true;
};


// ============================================================
// DELETE ROOM AES KEY
// ============================================================

export const deleteRoomEncryptionKey = async (
  roomId
) => {
  await deleteKey(
    getRoomKeyId(roomId)
  );

  return true;
};


// ============================================================
// CHECK ROOM KEY
// ============================================================

export const hasRoomEncryptionKey = async (
  roomId
) => {
  const roomKey =
    await getRoomEncryptionKey(roomId);

  return Boolean(roomKey);
};


// ============================================================
// WRAP ROOM KEY FOR PARTICIPANT
// ============================================================

/**
 * Encrypt the Room AES key using a pairwise key.
 *
 * IMPORTANT:
 *
 * roomKey
 *     = same AES key for the entire room
 *
 * pairwiseKey
 *     = unique AES key between two participants
 */
export const wrapRoomEncryptionKey = async (
  roomId,
  pairwiseKey
) => {
  const roomKey =
    await requireRoomEncryptionKey(roomId);

  return wrapRoomKey(
    roomKey,
    pairwiseKey
  );
};


// ============================================================
// UNWRAP ROOM KEY
// ============================================================

/**
 * Decrypt a wrapped Room AES key using
 * the pairwise key derived through ECDH.
 */
export const unwrapAndSaveRoomEncryptionKey = async (
  roomId,
  wrappedKey,
  iv,
  pairwiseKey
) => {
  if (!roomId) {
    throw new Error('Room ID is required.');
  }

  if (!wrappedKey) {
    throw new Error(
      'Wrapped room key is required.'
    );
  }

  if (!iv) {
    throw new Error(
      'Wrapped room key IV is required.'
    );
  }

  if (!pairwiseKey) {
    throw new Error(
      'Pairwise encryption key is required.'
    );
  }

  const roomKey =
    await unwrapRoomKey(
      wrappedKey,
      iv,
      pairwiseKey
    );

  await saveRoomEncryptionKey(
    roomId,
    roomKey
  );

  return roomKey;
};


// ============================================================
// CLEAR ALL ROOM DATA
// ============================================================

export const clearRoomEncryptionKey = async (
  roomId
) => {
  await deleteRoomEncryptionKey(roomId);
};