import { describe, expect, it, beforeEach } from 'vitest';
import { activateScriptsForConsent } from '../src/support/ScriptActivator.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('activateScriptsForConsent', () => {
  it('rıza verilen kategori için placeholder script gerçek script haline gelir', () => {
    document.body.innerHTML = `
      <script type="text/plain" data-anadolucookie="analytics" data-src="https://example.com/ga.js" data-foo="bar"></script>
    `;
    activateScriptsForConsent({ analytics: true });

    const script = document.querySelector('script[data-foo="bar"]');
    expect(script?.getAttribute('type')).toBeNull();
    expect(script?.getAttribute('src')).toBe('https://example.com/ga.js');
    expect(script?.hasAttribute('data-anadolucookie')).toBe(false);
  });

  it('rıza verilmeyen kategori için placeholder script değişmez', () => {
    document.body.innerHTML = `
      <script type="text/plain" data-anadolucookie="marketing" data-src="https://example.com/ads.js"></script>
    `;
    activateScriptsForConsent({ marketing: false });

    const placeholder = document.querySelector('script[data-anadolucookie="marketing"]');
    expect(placeholder).not.toBeNull();
    expect(placeholder?.getAttribute('type')).toBe('text/plain');
  });

  it('inline içerik korunur', () => {
    document.body.innerHTML = `
      <script type="text/plain" data-anadolucookie="functional">window.__ran = true;</script>
    `;
    activateScriptsForConsent({ functional: true });
    const script = document.querySelector('script:not([data-anadolucookie])') as HTMLScriptElement;
    expect(script.text).toContain('window.__ran = true;');
  });
});
