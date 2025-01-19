export function calculateStorageSize(storage: Storage): string {
  let totalSize = 0;
  for (let i = 0; i < storage.length; i++) {
    let key = storage.key(i);
    if (key) {
      totalSize += key.length * 2;
      let value = storage.getItem(key);
      if (value)
        totalSize += value.length * 2;
    }
  }
  return `${totalSize} o | ${(totalSize / (1024 * 1024))}`;
}

export function calculateSessionStorageSize(): string {
  return calculateStorageSize(sessionStorage);
}

export function calculateLocalStorageSize(): string {
  return calculateStorageSize(localStorage);
}

// has

export function hasDataInStorage(storage: Storage, key: string): boolean {
  return storage.getItem(key) !== null;
}

export function hasDataInLocalStorage(key: string): boolean {
  return hasDataInStorage(localStorage, key);
}

export function hasDataInSessionStorage(key: string): boolean {
  return hasDataInStorage(sessionStorage, key);
}

// Setter

export function setItem(storage: Storage, key: string, value: string): void {
  storage.setItem(key, value);
}

export function setItemInLocalStorage(key: string, value: string): void {
  setItem(localStorage, key, value);
}

export function setItemInSessionStorage(key: string, value: string): void {
  setItem(sessionStorage, key, value);
}

// Getter

export function getItemOrDefault(storage: Storage, key: string, defaultValue: string) {
  let v = storage.getItem(key);
  return v === null ? defaultValue : v;
}

export function getItemInLocalStorageOrDefault(key: string, defaultValue: string): string {
  return getItemOrDefault(localStorage, key, defaultValue);
}

export function getItemInSessionStorageOrDefault(key: string, defaultValue: string): string {
  return getItemOrDefault(sessionStorage, key, defaultValue);
}
