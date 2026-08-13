import { AnadoluCookieConfig, ConsentRecord, ConsentState } from './types.js';
import { DEFAULT_STORAGE_KEY, resolveLocale } from './support/locales.js';
import { ConsentStore } from './support/ConsentStore.js';
import { activateScriptsForConsent } from './support/ScriptActivator.js';
import { generateConsentId } from './support/id.js';
import { Banner } from './ui/Banner.js';

export class AnadoluCookie {
  private readonly store: ConsentStore;
  private readonly categories;
  private readonly texts;
  private readonly locale: string;
  private readonly version: number;
  private banner: Banner | null = null;
  private state: ConsentState | null = null;
  private recordId: string | null = null;
  private recordTimestamp: string | null = null;

  constructor(private readonly config: AnadoluCookieConfig = {}) {
    this.version = config.version ?? 1;
    this.locale = config.locale ?? 'tr';
    const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
    this.store = new ConsentStore(storageKey, this.version);

    const locale = resolveLocale(config.locale, config.locales);
    this.categories = config.categories ?? locale.categories;
    this.texts = { ...locale.texts, ...config.texts };
  }

  /** Kayıtlı rıza varsa uygular; yoksa banner'ı gösterir. Sayfa yüklenince bir kez çağırın. */
  init(): void {
    const saved = this.store.load();
    if (saved) {
      this.recordId = saved.id;
      this.recordTimestamp = saved.updatedAt;
      this.applyState(saved.state, false);
      return;
    }
    this.show();
  }

  show(): void {
    if (this.banner) return;
    const container = this.config.container ?? document.body;
    const initialState = this.buildDefaultState();
    this.banner = new Banner(
      this.categories,
      this.texts,
      this.config.position ?? 'bottom-right',
      this.config.theme ?? 'light',
      initialState,
      {
        onAcceptAll: () => this.acceptAll(),
        onRejectAll: () => this.rejectAll(),
        onSave: (state) => this.save(state),
      },
      container,
      this.config.style,
      this.config.className,
    );
    this.banner.mount();
  }

  hide(): void {
    this.banner?.unmount();
    this.banner = null;
  }

  acceptAll(): void {
    const state: ConsentState = {};
    for (const category of this.categories) state[category.key] = true;
    this.save(state);
  }

  rejectAll(): void {
    const state: ConsentState = {};
    for (const category of this.categories) state[category.key] = Boolean(category.locked);
    this.save(state);
  }

  showPreferences(): void {
    this.hide();
    this.show();
  }

  getConsent(): ConsentState | null {
    return this.state;
  }

  hasConsent(key: string): boolean {
    return Boolean(this.state?.[key]);
  }

  /**
   * Son rıza kararının denetlenebilir kaydını (id, sürüm, zaman damgası)
   * döner — kendi sunucunuza göndermek için `onRecord` yerine daha sonra
   * da kullanılabilir. Henüz karar verilmediyse `null` döner.
   */
  getConsentRecord(): ConsentRecord | null {
    if (!this.state || !this.recordId || !this.recordTimestamp) return null;
    return {
      id: this.recordId,
      state: this.state,
      version: this.version,
      locale: this.locale,
      timestamp: this.recordTimestamp,
    };
  }

  resetConsent(): void {
    this.store.clear();
    this.state = null;
    this.recordId = null;
    this.recordTimestamp = null;
    this.hide();
  }

  private buildDefaultState(): ConsentState {
    const state: ConsentState = {};
    for (const category of this.categories) {
      state[category.key] = Boolean(category.defaultEnabled);
    }
    return state;
  }

  private save(state: ConsentState): void {
    const id = generateConsentId();
    const stored = this.store.save(id, state);
    this.recordId = stored.id;
    this.recordTimestamp = stored.updatedAt;
    this.applyState(state, true);
    this.hide();
  }

  private applyState(state: ConsentState, isNewChoice: boolean): void {
    this.state = state;
    activateScriptsForConsent(state);
    if (isNewChoice) {
      this.config.onChange?.(state);
      const record = this.getConsentRecord();
      if (record) this.config.onRecord?.(record);
    }
  }
}

export function createAnadoluCookie(config?: AnadoluCookieConfig): AnadoluCookie {
  return new AnadoluCookie(config);
}
