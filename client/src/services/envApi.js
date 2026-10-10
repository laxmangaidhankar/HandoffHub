import config from "../config/env";

const getEnvUrl = (roomId) => {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  return `${config.apiBaseUrl}/api/v1/rooms/${roomId}/env`;
};

export const fetchEncryptedEnv = async (roomId) => {
  const url = getEnvUrl(roomId);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 404) {
    return { encryptedEnv: null };
  }
  

  const text = await response.text();

  if (!response.ok) {
    let error = {};

    try {
      error = JSON.parse(text);
    } catch {
      
    }

    const apiError = new Error(
      error.message || "Failed to fetch ENV data."
    );

    apiError.status = response.status;

    throw apiError;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "ENV API returned invalid JSON."
    );
  }
};

export const saveEncryptedEnv = async (
  roomId,
  encryptedEnv
) => {
  const url = getEnvUrl(roomId);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      encryptedEnv,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    let error = {};

    try {
      error = JSON.parse(text);
    } catch {
      // Response was not JSON
    }

    throw new Error(
      error.message || "Failed to save ENV data."
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "ENV save API returned invalid JSON."
    );
  }
};

export const deleteEncryptedEnv = async (roomId) => {
  const response = await fetch(getEnvUrl(roomId), {
    method: "DELETE",
    credentials: "include",
  });

  const text = await response.text();

  if (!response.ok) {
    let error = {};

    try {
      error = JSON.parse(text);
    } catch {}

    throw new Error(
      error.message || "Failed to delete ENV data."
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "ENV delete API returned invalid JSON."
    );
  }
};