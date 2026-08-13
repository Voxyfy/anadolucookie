export type AnadoluCookiePosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-full'
  | 'top-right'
  | 'top-left'
  | 'top-full';

export type AnadoluCookieTheme = 'light' | 'dark';

/**
 * `theme`'in üzerine yazılacak renk/köşe geçersiz kılmaları. Her alan bir
 * CSS rengi (hex, rgb, hsl, vb.) veya (borderRadius için) bir CSS boyutu
 * kabul eder. Sadece değiştirmek istediğiniz alanları verin.
 */
export interface AnadoluCookieStyle {
  background?: string;
  text?: string;
  border?: string;
  mutedText?: string;
  accent?: string;
  accentText?: string;
  borderRadius?: string;
}

export interface AnadoluCookieCategory {
  key: string;
  label: string;
  description?: string;
  locked?: boolean;
  defaultEnabled?: boolean;
}

export interface AnadoluCookieTexts {
  title?: string;
  description?: string;
  acceptAll?: string;
  rejectAll?: string;
  customize?: string;
  save?: string;
  back?: string;
}

export type ConsentState = Record<string, boolean>;

export interface StoredConsent {
  id: string;
  version: number;
  state: ConsentState;
  updatedAt: string;
}

/**
 * KVKK madde 20/1-ı ve ispat yükümlülüğü (madde 5) kapsamında saklanabilecek,
 * "hangi rıza ne zaman ve hangi metinle verildi" sorusuna cevap veren tam kayıt.
 * `onRecord` ile bu nesneyi kendi sunucunuza gönderip loglayabilirsiniz.
 */
export interface ConsentRecord {
  id: string;
  state: ConsentState;
  version: number;
  locale: string;
  timestamp: string;
}

export interface AnadoluCookieConfig {
  /** Yerleşik dil sözlüğü: 'tr' | 'en' (varsayılan: 'tr'). Kendi dilinizi eklemek için `locales` kullanın. */
  locale?: string;
  /** Yerleşik 'tr'/'en' sözlüklerine ek olarak veya onların yerine geçecek özel dil sözlükleri. */
  locales?: Record<string, { texts?: AnadoluCookieTexts; categories?: AnadoluCookieCategory[] }>;
  version?: number;
  categories?: AnadoluCookieCategory[];
  texts?: AnadoluCookieTexts;
  /** Banner'ın ekranda nerede çıkacağı. */
  position?: AnadoluCookiePosition;
  /** Hazır açık/koyu tema. */
  theme?: AnadoluCookieTheme;
  /** Seçili temanın üzerine yazılacak özel renkler/köşe yuvarlaklığı. */
  style?: AnadoluCookieStyle;
  /** Banner köküne eklenecek ek bir CSS sınıfı — kendi stylesheet'inizden tam kontrol için. */
  className?: string;
  storageKey?: string;
  container?: HTMLElement;
  onChange?: (state: ConsentState) => void;
  /**
   * Kullanıcı bir seçim yaptığında (kabul/reddet/kaydet), o kararın tam ve
   * denetlenebilir kaydını (id, zaman damgası, sürüm, dil) alır. KVKK'nın
   * ispat yükümlülüğü gereği rızayı kendi sunucunuzda saklamak isterseniz
   * bu kaydı `fetch` ile backend'inize gönderin — kütüphane bunu otomatik
   * göndermez, sadece kaydı sizin için hazırlar.
   */
  onRecord?: (record: ConsentRecord) => void;
}
