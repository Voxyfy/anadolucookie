import { ConsentState, StoredConsent } from '../types.js';

export class ConsentStore {
  constructor(
    private readonly storageKey: string,
    private readonly version: number,
  ) {}

  load(): StoredConsent | null {
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
    if (!raw) return null;

    let parsed: StoredConsent;
    try {
      parsed = JSON.parse(raw) as StoredConsent;
    } catch {
      return null;
    }

    if (parsed.version !== this.version) return null;
    return parsed;
  }

  save(id: string, state: ConsentState): StoredConsent {
    const payload: StoredConsent = {
      id,
      version: this.version,
      state,
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch {
      // localStorage kullanılamıyorsa (gizli mod, kota dolu vb.) sessizce yut; rıza yalnızca bellekte tutulur.
    }
    return payload;
  }

  clear(): void {
    try {
      window.localStorage.removeItem(this.storageKey);
    } catch {
      // yok say
    }
  }
}
