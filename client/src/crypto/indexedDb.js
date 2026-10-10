const DB_NAME = 'safehouse-db';
const DB_VERSION = 1;
const STORE_NAME = 'crypto-keys';

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(
        new Error('Failed to open SafeHouse IndexedDB.')
      );
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};


// ============================================
// Save a CryptoKey
// ============================================

export const saveKey = async (keyId, cryptoKey) => {
  if (!keyId) {
    throw new Error('Key ID is required.');
  }

  if (!cryptoKey) {
    throw new Error('CryptoKey is required.');
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(
      STORE_NAME
    );

    const request = store.put(
      cryptoKey,
      keyId
    );

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(
        new Error('Failed to save CryptoKey.')
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = () => {
      db.close();
    };
  });
};


// ============================================
// Get a CryptoKey
// ============================================

export const getKey = async (keyId) => {
  if (!keyId) {
    throw new Error('Key ID is required.');
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly'
    );

    const store = transaction.objectStore(
      STORE_NAME
    );

    const request = store.get(keyId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(
        new Error('Failed to retrieve CryptoKey.')
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = () => {
      db.close();
    };
  });
};


// ============================================
// Delete a CryptoKey
// ============================================

export const deleteKey = async (keyId) => {
  if (!keyId) {
    throw new Error('Key ID is required.');
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(
      STORE_NAME
    );

    const request = store.delete(keyId);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(
        new Error('Failed to delete CryptoKey.')
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = () => {
      db.close();
    };
  });
};


// ============================================
// Check whether a key exists
// ============================================

export const hasKey = async (keyId) => {
  if (!keyId) {
    throw new Error('Key ID is required.');
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly'
    );

    const store = transaction.objectStore(
      STORE_NAME
    );

    const request = store.getKey(keyId);

    request.onsuccess = () => {
      resolve(request.result !== undefined);
    };

    request.onerror = () => {
      reject(
        new Error('Failed to check CryptoKey.')
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = () => {
      db.close();
    };
  });
};