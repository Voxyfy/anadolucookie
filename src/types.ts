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

/**
 * Banner'ın her bir parçasına eklenecek ek CSS sınıfları — Tailwind gibi
 * bir utility-first framework kullanıyorsanız, kütüphanenin dahili
 * görünümünü değiştirmeden istediğiniz parçaya kendi utility class'larınızı
 * (`shadow-2xl`, `backdrop-blur`, `hover:opacity-90` vb.) ekleyebilirsiniz.
 * Her alan isteğe bağlıdır, verilmeyen parçalar dahili varsayılan
 * görünümde kalır.
 */
export interface AnadoluCookieClassNames {
  root?: string;
  panel?: string;
  title?: string;
  description?: string;
  categories?: string;
  category?: string;
  categoryLabel?: string;
  categoryDescription?: string;
  switch?: string;
  actions?: string;
  button?: string;
  buttonPrimary?: string;
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
  /** Banner'ın panel/başlık/buton gibi tek tek parçalarına eklenecek Tailwind vb. utility class'ları. */
  classNames?: AnadoluCookieClassNames;
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
