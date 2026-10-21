/* Formulário local: os dados só são compartilhados quando o visitante abre um canal de contato. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('site-nav');
  if (toggle && navigation) {
    const closeMenu = (restoreFocus = false) => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu de navegação');
      navigation.classList.remove('is-open');
      if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
      navigation.classList.toggle('is-open', open);
    });
    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    const desktop = window.matchMedia('(min-width: 981px)');
    desktop.addEventListener('change', () => closeMenu());
  }
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

  const form = document.getElementById('briefing-form');
  if (!form) return;
  const nameField = form.elements.namedItem('nome');
  const companyField = form.elements.namedItem('negocio');
  const serviceField = form.elements.namedItem('servico');
  const projectField = form.elements.namedItem('projeto');
  const result = document.getElementById('form-result');
  const preview = document.getElementById('message-preview');
  const whatsapp = document.getElementById('send-whatsapp');
  const email = document.getElementById('send-email');
  const copy = document.getElementById('copy-message');
  const status = document.getElementById('form-status');
  const phone = '5521965543716';
  const address = 'malhado.cstudio@gmail.com';
  if (!nameField || !companyField || !serviceField || !projectField || !result || !preview || !whatsapp || !email || !copy || !status) return;

  // Só aceita valores conhecidos. Mantém compatibilidade com links da versão anterior.
  const params = new URLSearchParams(window.__MALHADO_QUERY || window.location.search);
  const aliases = {essencial:'gestao-essencial',completo:'gestao-completo','pacote5':'reels-5','pacote10':'reels-10','criacao-avulsa':'criacao',eventos:'fotografia'};
  const requested = params.get('servico') || params.get('plano') || '';
  const chosen = aliases[requested] || requested;
  if (Array.from(serviceField.options).some(option => option.value === chosen)) serviceField.value = chosen;
  const objective = params.get('objetivo');
  if (objective) projectField.value = objective.slice(0, 500);

  nameField.addEventListener('input', () => nameField.setCustomValidity(''));
  // Alterar qualquer dado invalida a mensagem anterior para evitar o envio de uma versão desatualizada.
  form.addEventListener('input', event => {
    if (!event.target.closest('.form-result')) result.hidden = true;
  });
  form.addEventListener('change', event => {
    if (!event.target.closest('.form-result')) result.hidden = true;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    nameField.setCustomValidity(nameField.value.trim().length < 2 ? 'Informe seu nome com pelo menos 2 caracteres.' : '');
    if (!form.reportValidity()) return;
    const lines = ['Olá, MALHADO! Quero conversar sobre a comunicação da minha marca.', '', `Meu nome: ${nameField.value.trim()}`];
    if (companyField.value.trim()) lines.push(`Negócio: ${companyField.value.trim()}`);
    lines.push(`Tenho interesse em: ${serviceField.selectedOptions[0].textContent.trim()}`);
    if (projectField.value.trim()) lines.push('', `Meu objetivo: ${projectField.value.trim()}`);
    lines.push('', 'Podemos conversar sobre uma proposta?');
    const message = lines.join('\n');
    preview.value = message;
    whatsapp.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    email.href = `mailto:${address}?subject=${encodeURIComponent('Proposta — MALHADO Creative Studio')}&body=${encodeURIComponent(message)}`;
    status.textContent = 'Mensagem pronta. Nada foi enviado ainda. Abra o WhatsApp, revise e toque em Enviar.';
    result.hidden = false;
    result.focus({preventScroll:true});
    result.scrollIntoView({behavior:(document.documentElement.classList.contains('motion-off') || window.matchMedia('(prefers-reduced-motion: reduce)').matches)?'auto':'smooth',block:'nearest'});
  });
  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(preview.value);
      status.textContent = 'Mensagem copiada. Cole na conversa com o estúdio. Nada foi enviado automaticamente.';
    } catch {
      preview.focus();
      preview.select();
      status.textContent = 'Mensagem selecionada. Use a opção Copiar do seu dispositivo ou Ctrl+C / ⌘C.';
    }
  });
})();
