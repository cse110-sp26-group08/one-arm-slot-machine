import { DEFAULT_STATE, STORAGE_KEY } from "./config.js";

/**
 * Loads the last saved session. Invalid payloads fall back to defaults.
 */
export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_STATE };
  }

  try {
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (error) {
    console.warn("Could not restore Token Forge state.", error);
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
