export function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStorage(key) {
  const value = localStorage.getItem(key);

  if (value === null || value === undefined || value === "undefined") {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function removeStorage(key) {
  localStorage.removeItem(key);
}
