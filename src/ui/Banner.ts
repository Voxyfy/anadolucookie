import {
  AnadoluCookieCategory,
  AnadoluCookiePosition,
  AnadoluCookieStyle,
  AnadoluCookieTexts,
  AnadoluCookieTheme,
  ConsentState,
} from '../types.js';

const STYLE_ID = 'anadolucookie-styles';

const STYLES = `
.anadolucookie-root { position: fixed; z-index: 999999; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.anadolucookie-root * { box-sizing: border-box; }
.anadolucookie-root.pos-bottom-right { right: 16px; bottom: 16px; max-width: 380px; }
.anadolucookie-root.pos-bottom-left { left: 16px; bottom: 16px; max-width: 380px; }
.anadolucookie-root.pos-top-right { right: 16px; top: 16px; max-width: 380px; }
.anadolucookie-root.pos-top-left { left: 16px; top: 16px; max-width: 380px; }
.anadolucookie-root.pos-bottom-full { left: 0; right: 0; bottom: 0; --ac-radius: 0px; }
.anadolucookie-root.pos-top-full { left: 0; right: 0; top: 0; --ac-radius: 0px; }
.anadolucookie-panel { background: var(--ac-bg); color: var(--ac-fg); border: 1px solid var(--ac-border); border-radius: var(--ac-radius, 12px); padding: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
.anadolucookie-root.theme-light { --ac-bg: #ffffff; --ac-fg: #1a1a1a; --ac-border: #e2e2e2; --ac-muted: #666666; --ac-accent: #1a1a1a; --ac-accent-fg: #ffffff; }
.anadolucookie-root.theme-dark { --ac-bg: #1f1f1f; --ac-fg: #f2f2f2; --ac-border: #3a3a3a; --ac-muted: #b0b0b0; --ac-accent: #f2f2f2; --ac-accent-fg: #1a1a1a; }
.anadolucookie-title { font-weight: 600; font-size: 15px; margin: 0 0 6px; }
.anadolucookie-desc { font-size: 13px; color: var(--ac-muted); margin: 0 0 12px; line-height: 1.5; }
.anadolucookie-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.anadolucookie-btn { cursor: pointer; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500; border: 1px solid var(--ac-border); background: transparent; color: var(--ac-fg); }
.anadolucookie-btn.primary { background: var(--ac-accent); color: var(--ac-accent-fg); border-color: var(--ac-accent); }
.anadolucookie-categories { margin: 12px 0; display: flex; flex-direction: column; gap: 10px; max-height: 260px; overflow-y: auto; }
.anadolucookie-category { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.anadolucookie-category-text { flex: 1; }
.anadolucookie-category-label { font-size: 13px; font-weight: 600; margin: 0; }
.anadolucookie-category-desc { font-size: 12px; color: var(--ac-muted); margin: 2px 0 0; line-height: 1.4; }
.anadolucookie-switch { position: relative; width: 38px; height: 22px; flex-shrink: 0; }
.anadolucookie-switch input { opacity: 0; width: 0; height: 0; }
.anadolucookie-slider { position: absolute; inset: 0; background: var(--ac-border); border-radius: 22px; transition: background .15s; cursor: pointer; }
.anadolucookie-slider::before { content: ""; position: absolute; width: 16px; height: 16px; left: 3px; top: 3px; background: var(--ac-bg); border-radius: 50%; transition: transform .15s; }
.anadolucookie-switch input:checked + .anadolucookie-slider { background: var(--ac-accent); }
.anadolucookie-switch input:checked + .anadolucookie-slider::before { transform: translateX(16px); }
.anadolucookie-switch input:disabled + .anadolucookie-slider { opacity: 0.5; cursor: not-allowed; }
`;

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLES;
  document.head.appendChild(style);
}

export interface BannerCallbacks {
  onAcceptAll(): void;
  onRejectAll(): void;
  onSave(state: ConsentState): void;
}

const STYLE_VAR_MAP: Record<keyof AnadoluCookieStyle, string> = {
  background: '--ac-bg',
  text: '--ac-fg',
  border: '--ac-border',
  mutedText: '--ac-muted',
  accent: '--ac-accent',
  accentText: '--ac-accent-fg',
  borderRadius: '--ac-radius',
};

export class Banner {
  private readonly root: HTMLElement;
  private customizing = false;

  constructor(
    private readonly categories: AnadoluCookieCategory[],
    private readonly texts: Required<AnadoluCookieTexts>,
    private readonly position: AnadoluCookiePosition,
    private readonly theme: AnadoluCookieTheme,
    private readonly currentState: ConsentState,
    private readonly callbacks: BannerCallbacks,
    private readonly container: HTMLElement,
    private readonly style: AnadoluCookieStyle = {},
    private readonly className?: string,
  ) {
    ensureStyles();
    this.root = document.createElement('div');
    this.root.className = [`anadolucookie-root`, `pos-${this.position}`, `theme-${this.theme}`, this.className]
      .filter(Boolean)
      .join(' ');
    this.applyStyleOverrides();
    this.render();
  }

  private applyStyleOverrides(): void {
    for (const [key, cssVar] of Object.entries(STYLE_VAR_MAP) as [keyof AnadoluCookieStyle, string][]) {
      const value = this.style[key];
      if (value) this.root.style.setProperty(cssVar, value);
    }
  }

  mount(): void {
    this.container.appendChild(this.root);
  }

  unmount(): void {
    this.root.remove();
  }

  private render(): void {
    this.root.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'anadolucookie-panel';

    const title = document.createElement('p');
    title.className = 'anadolucookie-title';
    title.textContent = this.texts.title;
    panel.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'anadolucookie-desc';
    desc.textContent = this.texts.description;
    panel.appendChild(desc);

    if (this.customizing) {
      panel.appendChild(this.renderCategories());
    }

    panel.appendChild(this.renderActions());
    this.root.appendChild(panel);
  }

  private renderCategories(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'anadolucookie-categories';

    for (const category of this.categories) {
      const row = document.createElement('div');
      row.className = 'anadolucookie-category';

      const text = document.createElement('div');
      text.className = 'anadolucookie-category-text';
      const label = document.createElement('p');
      label.className = 'anadolucookie-category-label';
      label.textContent = category.label;
      text.appendChild(label);
      if (category.description) {
        const d = document.createElement('p');
        d.className = 'anadolucookie-category-desc';
        d.textContent = category.description;
        text.appendChild(d);
      }
      row.appendChild(text);

      const switchWrap = document.createElement('label');
      switchWrap.className = 'anadolucookie-switch';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = this.currentState[category.key] ?? Boolean(category.defaultEnabled);
      input.disabled = Boolean(category.locked);
      input.addEventListener('change', () => {
        this.currentState[category.key] = input.checked;
      });
      const slider = document.createElement('span');
      slider.className = 'anadolucookie-slider';
      switchWrap.appendChild(input);
      switchWrap.appendChild(slider);
      row.appendChild(switchWrap);

      wrap.appendChild(row);
    }

    return wrap;
  }

  private renderActions(): HTMLElement {
    const actions = document.createElement('div');
    actions.className = 'anadolucookie-actions';

    if (this.customizing) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'anadolucookie-btn';
      back.textContent = this.texts.back;
      back.addEventListener('click', () => {
        this.customizing = false;
        this.render();
      });
      actions.appendChild(back);

      const save = document.createElement('button');
      save.type = 'button';
      save.className = 'anadolucookie-btn primary';
      save.textContent = this.texts.save;
      save.addEventListener('click', () => this.callbacks.onSave(this.currentState));
      actions.appendChild(save);
      return actions;
    }

    const reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'anadolucookie-btn';
    reject.textContent = this.texts.rejectAll;
    reject.addEventListener('click', () => this.callbacks.onRejectAll());
    actions.appendChild(reject);

    const customize = document.createElement('button');
    customize.type = 'button';
    customize.className = 'anadolucookie-btn';
    customize.textContent = this.texts.customize;
    customize.addEventListener('click', () => {
      this.customizing = true;
      this.render();
    });
    actions.appendChild(customize);

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'anadolucookie-btn primary';
    accept.textContent = this.texts.acceptAll;
    accept.addEventListener('click', () => this.callbacks.onAcceptAll());
    actions.appendChild(accept);

    return actions;
  }
}
