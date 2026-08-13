# @voxyfy/anadolucookie — KVKK/GDPR Uyumlu Çerez Rıza (Cookie Consent) Banner Kütüphanesi

**anadolucookie**, web sitenizin sağ/sol alt köşesinde çıkan, ziyaretçiden
çerez kullanımı için açık rıza (KVKK madde 5, GDPR madde 6) alan; kabul
edilmeyen kategorilere ait üçüncü taraf script'lerin (Google Analytics,
Facebook Pixel, reklam etiketleri vb.) çalışmasını rıza verilene kadar
otomatik olarak engelleyen, tamamen ücretsiz ve açık kaynaklı bir **Node.js
/ TypeScript kütüphanesidir**. React, Vue, Angular ya da hiçbir framework
kullanmayan sade bir HTML sitede aynı şekilde çalışır — hiçbir framework'e
bağımlı değildir. Yerleşik olarak Türkçe (`tr`) ve İngilizce (`en`) dil
paketiyle gelir, `locales` seçeneğiyle istediğiniz herhangi bir dili (Almanca,
Fransızca, Arapça vb.) birkaç satırda ekleyebilirsiniz.

> ⚠️ **Bu kütüphane hukuki bir tavsiye niteliği taşımaz.** KVKK/GDPR
> uyumluluğunun teknik bir parçasını (rıza toplama + script engelleme)
> çözer; aydınlatma metni, veri işleme envanteri gibi diğer yükümlülükler
> kapsam dışındadır — bkz. [Sınırlamalar](#sınırlamalar).

## Bu kütüphane neden var, hangi soruna çözüm sunuyor?

KVKK'nın 5. maddesi ve GDPR'ın 6. maddesi, zorunlu olmayan çerezlerin
(analitik, pazarlama, üçüncü taraf takip script'leri) kullanıcıdan **açık
rıza alınmadan** çalıştırılmasını yasaklıyor. Uygulamada bu, "Google
Analytics kodunu sayfaya koydum, kullanıcı rıza vermeden de tarayıcısında
çalışıyor" gibi çok yaygın bir hataya yol açıyor — çünkü çoğu ekip script'i
doğrudan `<head>` içine yapıştırıyor ve rıza durumunu hiç kontrol etmiyor.

Hazır çözümler (Cookiebot, OneTrust, Osano vb.) genellikle aylık ücretli,
yurt dışı sunucularına veri gönderen ve Türkçe metinleri makine çevirisi
gibi duran araçlar. `anadolucookie` bunun yerine:

- **Hiçbir ağ isteği yapmaz** — rıza tercihi sadece kendi tarayıcınızın
  `localStorage`'ında tutulur, hiçbir sunucuya gönderilmez.
- **Script engellemeyi sizin yerinize yapar** — `<script type="text/plain"
  data-anadolucookie="analytics">` şeklinde işaretlediğiniz script'ler,
  kullanıcı o kategoriye onay verene kadar hiç çalışmaz.
- **Baştan Türkçe düşünülmüştür** — metinler makine çevirisi değil, KVKK
  terminolojisine uygun yazılmıştır; İngilizce dahil her dil eşit önceliklidir.
- **Sıfır bağımlılık, tek dosya** — `npm install` sonrası ~15KB'lık tek bir
  dosya, doğrudan `<script>` etiketiyle de kullanılabilir.

## Kurulum

```bash
npm install @voxyfy/anadolucookie
```

Node.js gerektirmez (tarayıcıda çalışır) — build aracınız (Vite, webpack,
Next.js vb.) üzerinden import edin. Node.js 18+ ile de sorunsuz bundlelanır.

### Script tag ile, hiç build aracı olmadan

```html
<script src="https://unpkg.com/@voxyfy/anadolucookie/dist/index.global.js"></script>
<script>
  AnadoluCookie.createAnadoluCookie().init();
</script>
```

## Hızlı başlangıç — 30 saniyede kullanım

```ts
import { createAnadoluCookie } from '@voxyfy/anadolucookie';

const cookie = createAnadoluCookie();

// Kayıtlı bir rıza varsa uygular; yoksa banner'ı gösterir.
cookie.init();
```

Sayfanıza aşağıdaki gibi bir işaretleme eklediğinizde, ilgili script sadece
kullanıcı "analytics" kategorisine onay verdiğinde çalışmaya başlar:

```html
<script type="text/plain" data-anadolucookie="analytics" data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
```

### Örnek 2 — Kullanıcının tarayıcı diline göre otomatik dil seçimi

```ts
const userLocale = navigator.language.startsWith('en') ? 'en' : 'tr';

createAnadoluCookie({ locale: userLocale }).init();
```

### Örnek 3 — Yerleşik `tr`/`en` dışında kendi dilinizi eklemek

Yerleşik olarak `tr` ve `en` gelir; başka bir dil için `locales` ile hem
metinleri hem kategori adlarını tanımlayabilirsiniz:

```ts
createAnadoluCookie({
  locale: 'de',
  locales: {
    de: {
      texts: {
        title: 'Cookie-Einstellungen',
        description: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.',
        acceptAll: 'Alle akzeptieren',
        rejectAll: 'Alle ablehnen',
        customize: 'Einstellungen verwalten',
        save: 'Auswahl speichern',
        back: 'Zurück',
      },
      categories: [
        { key: 'necessary', label: 'Notwendige Cookies', locked: true, defaultEnabled: true },
        { key: 'analytics', label: 'Analyse-Cookies' },
      ],
    },
  },
}).init();
```

### Örnek 4 — Tek dilli bir site için sadece bazı metinleri değiştirmek

Tüm bir dil sözlüğü tanımlamak zorunda değilsiniz — `texts` ile sadece
istediğiniz alanları geçersiz kılabilirsiniz:

```ts
createAnadoluCookie({
  locale: 'tr',
  texts: { title: 'Web Sitemiz Çerez Kullanıyor' },
}).init();
```

### Örnek 5 — Kendi kategorilerinizi tanımlamak

Varsayılan dört kategori (zorunlu/işlevsel/analitik/pazarlama) her siteye
uymayabilir — kendi kategori listenizi verebilirsiniz:

```ts
createAnadoluCookie({
  categories: [
    { key: 'necessary', label: 'Zorunlu', locked: true, defaultEnabled: true },
    { key: 'live-chat', label: 'Canlı Destek', description: 'Sohbet widget\'ının çalışması için gereklidir.' },
    { key: 'ads', label: 'Reklam Ağları' },
  ],
}).init();
```

### Örnek 6 — Konum, tema ve rıza değişimini dinlemek

Banner'ın ekranda nerede çıkacağını 6 konumdan seçebilirsiniz:
`'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`,
`'bottom-full'` (alt kenar boyunca tam genişlik), `'top-full'` (üst kenar
boyunca tam genişlik).

```ts
createAnadoluCookie({
  position: 'top-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-full' | 'top-full'
  theme: 'dark', // 'light' | 'dark'
  onChange: (state) => {
    console.log('Kullanıcı rızası güncellendi:', state);
    // Örn: state.analytics true olduğunda kendi analitik SDK'nızı burada da başlatabilirsiniz.
  },
}).init();
```

### Örnek 6.1 — Tasarımı markanıza göre özelleştirmek

Hazır `theme` (`'light'`/`'dark'`) size uymuyorsa, `style` ile tek tek
renkleri ve köşe yuvarlaklığını marka renklerinize göre değiştirebilir,
`className` ile de kendi CSS'inizden tam kontrol alabilirsiniz.

Her `style` alanı, banner'ın belirli bir parçasını değiştirir — hangi
alanı verirseniz tam olarak orası değişir, verilmeyen alanlar seçili
`theme`'in varsayılanında kalır:

| `style` alanı | CSS değişkeni | Bunu değiştirirseniz banner'da şu değişir |
|---|---|---|
| `background` | `--ac-bg` | Panelin arka plan rengi ve switch topuzunun rengi |
| `text` | `--ac-fg` | Başlık, buton metni (dolgusuz butonlarda) ve genel yazı rengi |
| `border` | `--ac-border` | Panelin dış çizgisi, buton kenarlıkları, switch'in kapalı hâldeki rengi |
| `mutedText` | `--ac-muted` | Açıklama metni ve kategori alt açıklamalarının (soluk) rengi |
| `accent` | `--ac-accent` | "Tümünü Kabul Et" butonunun arka planı ve açık (onaylı) switch'lerin rengi |
| `accentText` | `--ac-accent-fg` | "Tümünü Kabul Et" butonunun üzerindeki yazı rengi |
| `borderRadius` | `--ac-radius` | Panelin ve butonların köşe yuvarlaklığı (`0px` = tamamen köşeli) |

**Örnek A — sadece marka rengini değiştirmek:** aşağıdaki gibi sadece
`accent` verirseniz, geri kalan her şey (arka plan, yazı, kenarlık) seçili
`theme`'den gelir, sadece "Tümünü Kabul Et" butonu ve onaylı switch'ler
turuncu olur:

```ts
createAnadoluCookie({
  theme: 'light',
  style: { accent: '#ff5a1f', accentText: '#ffffff' },
}).init();
```

**Örnek B — köşeli/keskin bir görünüme geçmek:** sadece `borderRadius`
verirseniz, panel ve butonlardaki yuvarlak köşeler tamamen kaybolur,
diğer her şey aynı kalır:

```ts
createAnadoluCookie({
  style: { borderRadius: '0px' },
}).init();
```

**Örnek C — tüm renk paletini kendi markanıza göre baştan tanımlamak:**

```ts
createAnadoluCookie({
  theme: 'light',
  style: {
    background: '#ffffff',
    text: '#111111',
    border: '#e5e5e5',
    mutedText: '#6b7280',
    accent: '#ff5a1f', // "Tümünü Kabul Et" butonu ve açık switch'ler
    accentText: '#ffffff',
    borderRadius: '4px', // köşeli bir görünüm için
  },
  className: 'sirketim-cerez-banner', // kendi stylesheet'inizden ek stil vermek için
}).init();
```

`style`'a hiç dokunmadan da doğrudan kendi CSS'inizle tüm görünümü
değiştirebilirsiniz — yukarıdaki tablodaki CSS değişkenlerinin hepsini
kendi stylesheet'inizde `className` ile verdiğiniz sınıfın üzerine
yazabilirsiniz; bu, `style` config'iyle tamamen aynı sonucu üretir, sadece
TypeScript nesnesi yerine CSS ile yazılmıştır:

```css
.sirketim-cerez-banner {
  --ac-accent: #ff5a1f;
  --ac-radius: 4px;
  font-family: 'Inter', sans-serif;
}
```

### Örnek 7 — "Çerez tercihlerini yönet" bağlantısı (footer'a koymak için)

KVKK, kullanıcının tercihini daha sonra değiştirebilmesini gerektirir.
Footer'ınıza bir bağlantı ekleyip banner'ı yeniden açabilirsiniz:

```ts
const cookie = createAnadoluCookie();
cookie.init();

document.getElementById('cerez-tercihleri-linki')?.addEventListener('click', (e) => {
  e.preventDefault();
  cookie.showPreferences();
});
```

### Örnek 8 — React ile kullanım

Kütüphane framework-bağımsız olduğu için React'te basit bir `useEffect`
ile çalıştırabilirsiniz, ayrı bir React sarmalayıcı paketi gerekmez.
Bileşenin yeniden render olmasında banner'ın ikinci kez oluşmaması için
`cookie` referansını `useRef` ile saklayın:

```tsx
// hooks/useAnadoluCookie.ts
import { useEffect, useRef } from 'react';
import { AnadoluCookie, createAnadoluCookie, ConsentState } from '@voxyfy/anadolucookie';

export function useAnadoluCookie() {
  const cookieRef = useRef<AnadoluCookie | null>(null);

  useEffect(() => {
    const cookie = createAnadoluCookie({
      locale: navigator.language.startsWith('en') ? 'en' : 'tr',
      position: 'bottom-right',
      onChange: (state: ConsentState) => {
        if (state.analytics) {
          // Örn: window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
        }
      },
    });
    cookieRef.current = cookie;
    cookie.init();

    return () => cookie.hide();
  }, []);

  return cookieRef;
}
```

```tsx
// App.tsx
import { useAnadoluCookie } from './hooks/useAnadoluCookie';

function App() {
  const cookieRef = useAnadoluCookie();

  return (
    <footer>
      <button onClick={() => cookieRef.current?.showPreferences()}>
        Çerez Tercihlerini Yönet
      </button>
    </footer>
  );
}
```

### Örnek 8.1 — Vue 3 ile kullanım

Composition API'de aynı mantık `onMounted`/`onBeforeUnmount` ile çalışır:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createAnadoluCookie, AnadoluCookie } from '@voxyfy/anadolucookie';

const cookie = ref<AnadoluCookie | null>(null);

onMounted(() => {
  cookie.value = createAnadoluCookie({ locale: 'tr', theme: 'dark' });
  cookie.value.init();
});

onBeforeUnmount(() => {
  cookie.value?.hide();
});

function acikTercihler() {
  cookie.value?.showPreferences();
}
</script>

<template>
  <footer>
    <button @click="acikTercihler">Çerez Tercihlerini Yönet</button>
  </footer>
</template>
```

Nuxt 3 kullanıyorsanız, `localStorage`/`document` tarayıcıya özel olduğu
için bu kodu `<ClientOnly>` içine almanız veya `onMounted` içinde
çalıştırmaya devam etmeniz (SSR'da hiç render edilmediği için) yeterlidir.

### Örnek 9 — Kararı sıfırlamak (test veya "rızamı sıfırla" butonu için)

```ts
cookie.resetConsent(); // localStorage'daki kaydı siler, banner tekrar sorulacak hale gelir
```

### Örnek 10 — Sürüm (version) değiştirerek yeniden rıza sormak

Çerez politikanız değiştiğinde (yeni bir kategori eklediniz, bir üçüncü
tarafla anlaşma yaptınız vb.) `version` numarasını artırın — eski rızalar
otomatik olarak geçersiz sayılır ve banner yeniden gösterilir:

```ts
createAnadoluCookie({ version: 2 }).init();
```

### Örnek 11 — Rıza kararını kendi sunucunuzda kayıt altına almak (ispat yükümlülüğü)

Varsayılan davranışta rıza sadece kullanıcının kendi tarayıcısındaki
`localStorage`'da tutulur, hiçbir yere gönderilmez. Ama KVKK madde 20/1-ı ve
genel ispat yükümlülüğü gereği, "bu kullanıcı hangi tarihte, hangi sürüme
hangi kararı verdi" sorusuna sunucu tarafında da cevap verebilmeniz
gerekebilir (örn. bir denetimde göstermek için, veya kullanıcı tarayıcı
verisini/localStorage'ı temizlediğinde geçmişi kaybetmemek için). Bunun
için kütüphane hiçbir isteği kendisi göndermez — ama `onRecord` ile size
gerekli tüm bilgiyi (benzersiz `id`, zaman damgası, sürüm, dil) hazır olarak
verir, siz de bunu kendi backend'inize `fetch` ile gönderirsiniz:

```ts
createAnadoluCookie({
  onRecord: (record) => {
    // record: { id, state, version, locale, timestamp }
    fetch('/api/cerez-rizasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  },
}).init();
```

Bu isteği başarısız olsa da kullanıcı deneyimini bozmaz — banner zaten
`localStorage`'a kaydını yapmıştır, sunucuya gönderim tamamen isteğe
bağlı bir ek kayıt katmanıdır. Daha sonra aynı kaydı tekrar okumak
isterseniz `cookie.getConsentRecord()` ile de erişebilirsiniz.

## API

| Metot | Açıklama |
|---|---|
| `init()` | Kayıtlı rıza varsa uygular (script'leri aktif eder), yoksa banner'ı gösterir. Sayfa yüklenince bir kez çağırın. |
| `show()` | Banner'ı zorla gösterir. |
| `hide()` | Banner'ı kapatır. |
| `showPreferences()` | Banner'ı, "tercihleri yönet" görünümü açık şekilde yeniden gösterir. |
| `acceptAll()` | Tüm kategorilere onay verir ve kaydeder. |
| `rejectAll()` | Zorunlu (`locked`) hariç tüm kategorileri reddeder ve kaydeder. |
| `getConsent()` | O anki rıza durumunu (`{ [kategori]: boolean }`) veya kayıt yoksa `null` döner. |
| `hasConsent(key)` | Belirli bir kategoriye onay verilip verilmediğini döner. |
| `getConsentRecord()` | Son rıza kararının `{ id, state, version, locale, timestamp }` şeklindeki denetlenebilir kaydını, veya henüz karar verilmediyse `null` döner. |
| `resetConsent()` | Kaydı `localStorage`'dan siler, banner'ı kapatır. |

## Yapılandırma seçenekleri (`AnadoluCookieConfig`)

| Seçenek | Tür | Varsayılan | Açıklama |
|---|---|---|---|
| `locale` | `string` | `'tr'` | Yerleşik `'tr'` / `'en'` sözlüklerinden biri, ya da `locales` ile tanımladığınız özel bir dil kodu. |
| `locales` | `Record<string, {...}>` | — | Yerleşik dillere ek özel dil sözlükleri (metin + kategori). |
| `texts` | `object` | — | Seçili dilin üzerine yazılacak tekil metin geçersiz kılmaları. |
| `categories` | `array` | 4 varsayılan kategori | Kategori listesini tamamen değiştirir. |
| `position` | `string` | `'bottom-right'` | `'bottom-right'` \| `'bottom-left'` \| `'top-right'` \| `'top-left'` \| `'bottom-full'` \| `'top-full'` |
| `theme` | `string` | `'light'` | `'light'` \| `'dark'` |
| `style` | `object` | — | `{ background, text, border, mutedText, accent, accentText, borderRadius }` — seçili temanın renklerini/köşe yuvarlaklığını tek tek geçersiz kılar, bkz. [Örnek 6.1](#örnek-61--tasarımı-markanıza-göre-özelleştirmek). |
| `className` | `string` | — | Banner köküne eklenecek ek CSS sınıfı — kendi stylesheet'inizden tam kontrol için. |
| `version` | `number` | `1` | Değiştirildiğinde eski rızalar geçersiz sayılır. |
| `storageKey` | `string` | `'anadolucookie_consent'` | `localStorage` anahtarı — aynı sitede birden fazla örnek çalıştırıyorsanız değiştirin. |
| `container` | `HTMLElement` | `document.body` | Banner'ın ekleneceği DOM elemanı. |
| `onChange` | `(state) => void` | — | Kullanıcı bir seçim yaptığında (kabul/reddet/kaydet) tetiklenir, sadece o anki durumu (`state`) verir. |
| `onRecord` | `(record) => void` | — | Aynı anda, denetlenebilir tam kaydı (`id`, `version`, `locale`, `timestamp` dahil) verir — sunucuda kayıt tutmak için kullanışlıdır, bkz. [Örnek 11](#örnek-11--rıza-kararını-kendi-sunucunuzda-kayıt-altına-almak-ispat-yükümlülüğü). |

## Sınırlamalar — dürüstçe neyi yapmadığını bilin

- **Zaten çalışmaya başlamış bir script'i geriye dönük durduramaz.**
  Script engelleme, sadece `type="text/plain" data-anadolucookie="..."`
  şeklinde işaretlediğiniz etiketler için geçerlidir — sayfanıza normal
  `<script src="...">` olarak eklenmiş bir kod, kütüphane devreye girmeden
  önce zaten tarayıcıda çalışmaya başlamış olur. Üçüncü taraf script'lerinizi
  bu formata taşımanız gerekir.
- **Sunucu taraflı (server-side) çerezleri veya HTTP-only çerezleri
  yönetmez.** Bu kütüphane tarayıcı tarafında çalışan bir arayüz ve rıza
  kaydıdır; backend'inizde set ettiğiniz oturum/analitik çerezlerinin
  kendisini engellemez — o çerezleri set eden isteği (örn. bir API çağrısını)
  `hasConsent()` ile kendi kodunuzda koşullamanız gerekir.
- **Hukuki metin/aydınlatma metni sağlamaz.** Varsayılan metinler genel
  amaçlıdır; KVKK'nın gerektirdiği aydınlatma metnini kendi hukuk
  danışmanınızla hazırlamanız ve `texts.description` alanına eklemeniz
  gerekir.
- **Google Consent Mode v2 veya Meta Pixel'in kendi rıza API'si gibi
  sağlayıcıya özel entegrasyonlar içermez.** Google Analytics/Ads,
  kullanıcının `ad_storage`/`analytics_storage` iznini kendi
  `gtag('consent', 'update', {...})` çağrısıyla öğrenir; Meta Pixel de
  benzer şekilde `fbq('consent', 'grant' | 'revoke')` bekler. Bu kütüphane
  bu sağlayıcıya özel çağrıları kendisi yapmaz — ama `onChange`
  callback'i içinde, kullanıcı bir kategoriye onay verdiğinde bu
  çağrıları siz tetikleyebilirsiniz (bkz. [Örnek 8](#örnek-8--react-ile-kullanım)'deki
  `onChange` yorum satırı).

## Sıkça sorulan sorular

**Rıza tercihi nerede saklanıyor, bir sunucuya gönderiliyor mu?**
Varsayılan davranışta hayır — tercih sadece kullanıcının kendi
tarayıcısındaki `localStorage`'da tutulur, kütüphane kendisi hiçbir ağ
isteği yapmaz. İspat yükümlülüğü gereği rızayı kendi sunucunuzda da kayıt
altına almak isterseniz `onRecord` callback'ini kullanabilirsiniz — bkz.
[Örnek 11](#örnek-11--rıza-kararını-kendi-sunucunuzda-kayıt-altına-almak-ispat-yükümlülüğü).
Bu tamamen isteğe bağlıdır, siz eklemediğiniz sürece hiçbir veri
tarayıcı dışına çıkmaz.

**React/Vue/Next.js ile kullanabilir miyim?**
Evet. Kütüphane framework-bağımsızdır, herhangi bir framework'ün yaşam
döngüsü fonksiyonunda (`useEffect`, `onMounted` vb.) çalıştırabilirsiniz.

**Sadece Türkçe mi çalışır?**
Hayır. Yerleşik olarak `tr` ve `en` gelir; `locales` seçeneğiyle istediğiniz
başka bir dili de birkaç satırda ekleyebilirsiniz.

**Google Analytics / Meta Pixel gibi script'lerimi nasıl engellerim?**
Script etiketinizin `type`'ını `text/plain` yapıp `data-anadolucookie`
özniteliğine hangi kategoriye bağlı olduğunu yazmanız yeterli — kullanıcı
o kategoriye onay verdiğinde kütüphane script'i otomatik olarak gerçek bir
`<script>` etiketine çevirir.

**Google Consent Mode v2 / Meta Pixel'in kendi rıza sinyali ne, bunu da göndermem gerekiyor mu?**
Bunlar, script'in çalışıp çalışmamasından ayrı olarak Google/Meta'nın
kendi sunucularına "bu kullanıcı analitik/reklam iznine onay verdi mi?"
bilgisini bildiren, o sağlayıcıya özel birer fonksiyon çağrısıdır
(`gtag('consent', 'update', {...})` / `fbq('consent', 'grant')`). Sadece
script'i `data-anadolucookie` ile engellemek çoğu kurulum için yeterlidir;
ama Google Ads/Analytics'in kendi ölçümleme modelinden ("consent mode
modeling") tam olarak yararlanmak istiyorsanız, bu çağrıyı da kendi
`onChange` callback'inizde tetiklemeniz gerekir — kütüphane bunu sizin
adınıza otomatik yapmaz, çünkü bu tamamen Google/Meta'ya özeldir ve
sitenizin hangi sağlayıcıları kullandığına bağlıdır.

## İlgili projeler

Aynı ekip tarafından geliştirilen, aynı sade ve tek amaca odaklı yaklaşımla
yazılmış diğer açık kaynak kütüphaneler:

- **[Voxyfy/anadolupay](https://github.com/Voxyfy/anadolupay)** (PHP/Laravel)
  ve **[Voxyfy/anadolupay-node](https://github.com/Voxyfy/anadolupay-node)**
  ([npm](https://www.npmjs.com/package/@voxyfy/anadolupay)) — Türk banka ve
  ödeme sağlayıcıları için tek arayüzlü ödeme kütüphanesi.
- **[Voxyfy/anadoluship](https://github.com/Voxyfy/anadoluship)**
  ([npm](https://www.npmjs.com/package/@voxyfy/anadoluship)) — Türk kargo
  firmaları (MNG, UPS, Yurtiçi, Aras, PTT, Sürat) için tek arayüzlü kargo
  ve gönderi takip kütüphanesi.
- **[Voxyfy/anadolushield](https://github.com/Voxyfy/anadolushield)**
  ([npm](https://www.npmjs.com/package/@voxyfy/anadolushield)) — yapay
  zeka servislerine göndermeden önce TCKN/VKN/IBAN/isim gibi kişisel
  verileri maskeleyen KVKK kütüphanesi.

## Lisans

MIT
