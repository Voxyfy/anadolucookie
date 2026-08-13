import { ConsentState } from '../types.js';

const PLACEHOLDER_SELECTOR = 'script[type="text/plain"][data-anadolucookie]';

function activateScript(placeholder: HTMLScriptElement): void {
  const script = document.createElement('script');
  for (const attr of Array.from(placeholder.attributes)) {
    if (attr.name === 'type' || attr.name === 'data-anadolucookie') continue;
    if (attr.name === 'data-src') {
      script.setAttribute('src', attr.value);
      continue;
    }
    script.setAttribute(attr.name, attr.value);
  }
  script.text = placeholder.text;
  placeholder.replaceWith(script);
}

export function activateScriptsForConsent(state: ConsentState, root: ParentNode = document): void {
  const placeholders = root.querySelectorAll<HTMLScriptElement>(PLACEHOLDER_SELECTOR);
  for (const placeholder of Array.from(placeholders)) {
    const category = placeholder.getAttribute('data-anadolucookie');
    if (category && state[category]) {
      activateScript(placeholder);
    }
  }
}
