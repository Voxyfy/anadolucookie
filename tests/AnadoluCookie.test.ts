import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAnadoluCookie } from '../src/AnadoluCookie.js';

beforeEach(() => {
  document.body.innerHTML = '';
  window.localStorage.clear();
  document.getElementById('anadolucookie-styles')?.remove();
});

describe('AnadoluCookie', () => {
  it('kayıtlı rıza yoksa banner gösterir', () => {
    const cookie = createAnadoluCookie();
    cookie.init();
    expect(document.querySelector('.anadolucookie-root')).not.toBeNull();
  });

  it('tümünü kabul et tıklanınca tüm kategoriler true olur ve banner kapanır', () => {
    const onChange = vi.fn();
    const cookie = createAnadoluCookie({ onChange });
    cookie.init();

    const acceptBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Tümünü Kabul Et')!;
    acceptBtn.click();

    expect(document.querySelector('.anadolucookie-root')).toBeNull();
    expect(cookie.hasConsent('analytics')).toBe(true);
    expect(cookie.hasConsent('necessary')).toBe(true);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ analytics: true, necessary: true }));
  });

  it('tümünü reddet tıklanınca zorunlu hariç tüm kategoriler false olur', () => {
    const cookie = createAnadoluCookie();
    cookie.init();

    const rejectBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Tümünü Reddet')!;
    rejectBtn.click();

    expect(cookie.hasConsent('necessary')).toBe(true);
    expect(cookie.hasConsent('analytics')).toBe(false);
    expect(cookie.hasConsent('marketing')).toBe(false);
  });

  it('kayıtlı rıza varsa init sonrası banner gösterilmez', () => {
    const first = createAnadoluCookie();
    first.init();
    const acceptBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Tümünü Kabul Et')!;
    acceptBtn.click();

    document.body.innerHTML = '';
    const second = createAnadoluCookie();
    second.init();

    expect(document.querySelector('.anadolucookie-root')).toBeNull();
    expect(second.hasConsent('marketing')).toBe(true);
  });

  it('version değişirse eski rıza geçersiz sayılır ve banner yeniden gösterilir', () => {
    const v1 = createAnadoluCookie({ version: 1 });
    v1.init();
    const acceptBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Tümünü Kabul Et')!;
    acceptBtn.click();

    document.body.innerHTML = '';
    const v2 = createAnadoluCookie({ version: 2 });
    v2.init();

    expect(document.querySelector('.anadolucookie-root')).not.toBeNull();
    expect(v2.getConsent()).toBeNull();
  });

  it('resetConsent depoyu temizler ve banner kapanır', () => {
    const cookie = createAnadoluCookie();
    cookie.init();
    const acceptBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Tümünü Kabul Et')!;
    acceptBtn.click();

    cookie.resetConsent();
    expect(window.localStorage.getItem('anadolucookie_consent')).toBeNull();
    expect(cookie.getConsent()).toBeNull();
  });

  it('locale=en verilince İngilizce metinler gösterilir', () => {
    const cookie = createAnadoluCookie({ locale: 'en' });
    cookie.init();
    expect(document.querySelector('.anadolucookie-title')?.textContent).toBe('Cookie Preferences');
    expect(Array.from(document.querySelectorAll('button')).some((b) => b.textContent === 'Accept All')).toBe(true);
  });

  it('özel locales ile ek bir dil (de) tanımlanabilir', () => {
    const cookie = createAnadoluCookie({
      locale: 'de',
      locales: {
        de: {
          texts: { title: 'Cookie-Einstellungen', acceptAll: 'Alle akzeptieren' },
        },
      },
    });
    cookie.init();
    expect(document.querySelector('.anadolucookie-title')?.textContent).toBe('Cookie-Einstellungen');
    expect(Array.from(document.querySelectorAll('button')).some((b) => b.textContent === 'Alle akzeptieren')).toBe(true);
  });

  it('bilinmeyen locale verilince tr varsayılana düşer', () => {
    const cookie = createAnadoluCookie({ locale: 'xx' });
    cookie.init();
    expect(document.querySelector('.anadolucookie-title')?.textContent).toBe('Çerez Tercihleri');
  });

  it('texts ile bireysel metin override edilebilir', () => {
    const cookie = createAnadoluCookie({ texts: { title: 'Özel Başlık' } });
    cookie.init();
    expect(document.querySelector('.anadolucookie-title')?.textContent).toBe('Özel Başlık');
  });

  it('bir karar verilince onRecord, id/version/locale/timestamp içeren bir kayıt alır', () => {
    const onRecord = vi.fn();
    const cookie = createAnadoluCookie({ onRecord, version: 3, locale: 'en' });
    cookie.init();

    const acceptBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Accept All')!;
    acceptBtn.click();

    expect(onRecord).toHaveBeenCalledTimes(1);
    const record = onRecord.mock.calls[0][0];
    expect(typeof record.id).toBe('string');
    expect(record.id.length).toBeGreaterThan(0);
    expect(record.version).toBe(3);
    expect(record.locale).toBe('en');
    expect(typeof record.timestamp).toBe('string');
    expect(record.state.analytics).toBe(true);
  });

  it('getConsentRecord, kaydedilmiş rızayı sayfa yeniden yüklendiğinde de aynı id ile döner', () => {
    const first = createAnadoluCookie();
    first.init();
    const acceptBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Tümünü Kabul Et')!;
    acceptBtn.click();
    const firstRecord = first.getConsentRecord();

    document.body.innerHTML = '';
    const second = createAnadoluCookie();
    second.init();
    const secondRecord = second.getConsentRecord();

    expect(secondRecord?.id).toBe(firstRecord?.id);
  });

  it('karar verilmeden getConsentRecord null döner', () => {
    const cookie = createAnadoluCookie();
    expect(cookie.getConsentRecord()).toBeNull();
  });

  it('position ile verilen konum kök elemana sınıf olarak yansır', () => {
    const cookie = createAnadoluCookie({ position: 'top-left' });
    cookie.init();
    expect(document.querySelector('.anadolucookie-root.pos-top-left')).not.toBeNull();
  });

  it('className ile verilen özel sınıf kök elemana eklenir', () => {
    const cookie = createAnadoluCookie({ className: 'benim-sinifim' });
    cookie.init();
    expect(document.querySelector('.anadolucookie-root.benim-sinifim')).not.toBeNull();
  });

  it('style ile verilen renkler CSS değişkeni olarak kök elemana uygulanır', () => {
    const cookie = createAnadoluCookie({
      style: { accent: '#ff0000', borderRadius: '0px' },
    });
    cookie.init();
    const root = document.querySelector<HTMLElement>('.anadolucookie-root')!;
    expect(root.style.getPropertyValue('--ac-accent')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--ac-radius')).toBe('0px');
  });

  it('classNames ile verilen Tailwind vb. sınıflar ilgili parçalara eklenir', () => {
    const cookie = createAnadoluCookie({
      classNames: {
        panel: 'shadow-2xl backdrop-blur',
        buttonPrimary: 'hover:opacity-90',
        title: 'tracking-tight',
      },
    });
    cookie.init();

    expect(document.querySelector('.anadolucookie-panel.shadow-2xl.backdrop-blur')).not.toBeNull();
    expect(document.querySelector('.anadolucookie-title.tracking-tight')).not.toBeNull();
    const primaryButtons = Array.from(document.querySelectorAll('.anadolucookie-btn.primary'));
    expect(primaryButtons.every((b) => b.classList.contains('hover:opacity-90'))).toBe(true);
  });

  it('classNames.button verilmeyen normal (primary olmayan) butonlara da eklenir', () => {
    const cookie = createAnadoluCookie({
      classNames: { button: 'font-medium' },
    });
    cookie.init();

    const rejectBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Tümünü Reddet')!;
    expect(rejectBtn.classList.contains('font-medium')).toBe(true);
  });
});
