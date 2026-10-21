/* Identidade original: arquivos existentes no repositório. Não redesenha a marca. */
(() => {
  'use strict';
  const origin = 'https://raw.githubusercontent.com/emillymalhado/site-malhado-cstudio/main/';
  const published = 'https://emillymalhado.github.io/site-malhado-cstudio/';
  document.querySelectorAll('img.brand-original').forEach(image => {
    const name = image.closest('.site-footer') ? 'logobranca.png.png' : 'logo.png.png';
    const fallback = image.parentElement.querySelector('.brand-unavailable');
    const candidates = [name, origin + name, published + name];
    const tried = new Set([image.getAttribute('src')]);
    const loaded = () => {
      image.hidden = false;
      if (fallback) fallback.hidden = true;
      image.dataset.logoState = 'loaded';
    };
    const next = () => {
      const source = candidates.find(url => !tried.has(url));
      if (source) { tried.add(source); image.src = source; return; }
      image.dataset.logoState = 'unavailable';
      image.hidden = true;
      if (fallback) fallback.hidden = false;
      // The preview can offer an explicit import of the real file, never a substitute logo.
      window.dispatchEvent(new CustomEvent('malhado-logo-unavailable', {detail:{file:name}}));
    };
    // Eager loading prevents a hidden lazy footer image from waiting indefinitely.
    image.loading = 'eager';
    if (!image.complete || !image.naturalWidth) { image.hidden = true; if (fallback) fallback.hidden = false; }
    image.addEventListener('load', loaded);
    image.addEventListener('error', next);
    if (image.complete) image.naturalWidth ? loaded() : next();
  });
})();
