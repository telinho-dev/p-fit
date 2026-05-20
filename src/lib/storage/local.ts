import { EMPTY_DATA, type AppData, type StorageAdapter } from "./types";

const KEY = "pfit:data:v1";

export class LocalStorageAdapter implements StorageAdapter {
  readonly kind = "local" as const;

  async load(): Promise<AppData> {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY_DATA);
    try {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed.version !== 1) return structuredClone(EMPTY_DATA);
      return parsed;
    } catch {
      return structuredClone(EMPTY_DATA);
    }
  }

  async save(data: AppData): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
}
