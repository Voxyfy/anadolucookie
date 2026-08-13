import { describe, expect, it, beforeEach } from 'vitest';
import { ConsentStore } from '../src/support/ConsentStore.js';

beforeEach(() => {
  window.localStorage.clear();
});

describe('ConsentStore', () => {
  it('kaydedilen state, id ve version ile birlikte aynı version ile geri okunabilir', () => {
    const store = new ConsentStore('test_key', 1);
    store.save('rec-1', { necessary: true, analytics: false });

    const loaded = store.load();
    expect(loaded?.id).toBe('rec-1');
    expect(loaded?.version).toBe(1);
    expect(loaded?.state).toEqual({ necessary: true, analytics: false });
    expect(typeof loaded?.updatedAt).toBe('string');
  });

  it('version uyuşmazsa null döner', () => {
    const v1 = new ConsentStore('test_key', 1);
    v1.save('rec-1', { necessary: true });

    const v2 = new ConsentStore('test_key', 2);
    expect(v2.load()).toBeNull();
  });

  it('kayıt yoksa null döner', () => {
    const store = new ConsentStore('missing_key', 1);
    expect(store.load()).toBeNull();
  });

  it('clear ile kayıt silinir', () => {
    const store = new ConsentStore('test_key', 1);
    store.save('rec-1', { necessary: true });
    store.clear();
    expect(store.load()).toBeNull();
  });

  it('bozuk JSON güvenli şekilde null döner', () => {
    window.localStorage.setItem('test_key', 'not-json{{{');
    const store = new ConsentStore('test_key', 1);
    expect(store.load()).toBeNull();
  });
});
