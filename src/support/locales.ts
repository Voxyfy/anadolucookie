import { AnadoluCookieCategory, AnadoluCookieTexts } from '../types.js';

export const DEFAULT_STORAGE_KEY = 'anadolucookie_consent';

export interface LocaleDictionary {
  texts: Required<AnadoluCookieTexts>;
  categories: AnadoluCookieCategory[];
}

export const LOCALES: Record<string, LocaleDictionary> = {
  tr: {
    texts: {
      title: 'Çerez Tercihleri',
      description:
        'KVKK kapsamında, deneyiminizi iyileştirmek için çerezler kullanıyoruz. Aşağıdan tercihlerinizi seçebilir veya tümünü kabul edebilirsiniz.',
      acceptAll: 'Tümünü Kabul Et',
      rejectAll: 'Tümünü Reddet',
      customize: 'Tercihleri Yönet',
      save: 'Seçimleri Kaydet',
      back: 'Geri',
    },
    categories: [
      {
        key: 'necessary',
        label: 'Zorunlu Çerezler',
        description: 'Sitenin çalışması için gereklidir, kapatılamaz.',
        locked: true,
        defaultEnabled: true,
      },
      {
        key: 'functional',
        label: 'İşlevsel Çerezler',
        description: 'Tercihlerinizi hatırlamamızı sağlar (dil, bölge vb.).',
        defaultEnabled: false,
      },
      {
        key: 'analytics',
        label: 'Analitik Çerezler',
        description: 'Siteyi nasıl kullandığınızı anlamamıza yardımcı olur.',
        defaultEnabled: false,
      },
      {
        key: 'marketing',
        label: 'Pazarlama Çerezleri',
        description: 'İlgi alanlarınıza uygun reklamlar gösterilmesini sağlar.',
        defaultEnabled: false,
      },
    ],
  },
  en: {
    texts: {
      title: 'Cookie Preferences',
      description:
        'We use cookies to improve your experience. You can choose your preferences below or accept all.',
      acceptAll: 'Accept All',
      rejectAll: 'Reject All',
      customize: 'Manage Preferences',
      save: 'Save Choices',
      back: 'Back',
    },
    categories: [
      {
        key: 'necessary',
        label: 'Necessary Cookies',
        description: 'Required for the site to function, cannot be disabled.',
        locked: true,
        defaultEnabled: true,
      },
      {
        key: 'functional',
        label: 'Functional Cookies',
        description: 'Lets us remember your preferences (language, region, etc.).',
        defaultEnabled: false,
      },
      {
        key: 'analytics',
        label: 'Analytics Cookies',
        description: 'Helps us understand how you use the site.',
        defaultEnabled: false,
      },
      {
        key: 'marketing',
        label: 'Marketing Cookies',
        description: 'Enables ads relevant to your interests.',
        defaultEnabled: false,
      },
    ],
  },
};

export const DEFAULT_LOCALE = 'tr';

export type CustomLocaleInput = Record<string, { texts?: AnadoluCookieTexts; categories?: AnadoluCookieCategory[] }>;

export function resolveLocale(locale: string | undefined, customLocales: CustomLocaleInput = {}): LocaleDictionary {
  const key = locale ?? DEFAULT_LOCALE;
  const base = LOCALES[key] ?? LOCALES[DEFAULT_LOCALE]!;
  const override = customLocales[key];
  if (!override) return base;
  return {
    texts: { ...base.texts, ...override.texts },
    categories: override.categories ?? base.categories,
  };
}
