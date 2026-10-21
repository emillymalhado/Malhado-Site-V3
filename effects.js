/* MALHADO / movimento, descoberta e navegação por etapas. Sem bibliotecas ou rastreamento. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const storageKey = 'malhado-motion-paused';
  let manuallyPaused = false;
  try { manuallyPaused = sessionStorage.getItem(storageKey) === '1'; } catch (_) { /* file:// ou privacidade restrita: controle continua funcionando nesta página. */ }
  const controls = Array.from(document.querySelectorAll('[data-motion-toggle]'));
  const motionAllowed = () => !manuallyPaused && !reduced.matches;
  const resetTilts = () => document.querySelectorAll('[data-tilt]').forEach(el => {
    el.style.removeProperty('--tilt-x'); el.style.removeProperty('--tilt-y');
  });
  const updateMotion = () => {
    const paused = !motionAllowed();
    root.classList.toggle('motion-off', paused);
    resetTilts();
    controls.forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(paused));
      const label = reduced.matches ? 'Efeitos reduzidos pela preferência do seu dispositivo' : (paused ? 'Ativar efeitos de movimento' : 'Pausar efeitos de movimento');
      button.setAttribute('aria-label', label);
      button.title = label;
      button.setAttribute('aria-disabled', String(reduced.matches));
    });
    if (paused) document.querySelectorAll('.will-reveal').forEach(el => el.classList.add('is-visible'));
  };
  controls.forEach(button => button.addEventListener('click', () => {
    if (reduced.matches) return;
    manuallyPaused = !manuallyPaused;
    try { sessionStorage.setItem(storageKey, manuallyPaused ? '1' : '0'); } catch (_) {}
    updateMotion();
  }));
  reduced.addEventListener('change', updateMotion);
  updateMotion();

  // As animações não disputam recursos quando a cena sai de vista.
  if ('IntersectionObserver' in window) {
    const scenes = new IntersectionObserver(entries => entries.forEach(({target,isIntersecting}) => target.classList.toggle('scene-sleep', !isIntersecting)), {rootMargin:'100px'});
    document.querySelectorAll('.chromatic-stage,.brand-art,.finder-section,.studio-teaser,.service-ribbon,.cta,.conversion-path').forEach(el => scenes.observe(el));
    const reveal = new IntersectionObserver(entries => entries.forEach(({target,isIntersecting}) => {
      if (isIntersecting) { target.classList.add('is-visible'); reveal.unobserve(target); }
    }), {threshold:0.07,rootMargin:'0px 0px -25px 0px'});
    if (motionAllowed()) {
      document.querySelectorAll('[data-reveal]').forEach(el => {
        // Nunca esconda o conteúdo que já está na primeira tela.
        if (el.getBoundingClientRect().top > innerHeight - 30) {
          el.classList.add('will-reveal');
          const siblings = Array.from(el.parentElement.children).filter(item => item.hasAttribute('data-reveal'));
          el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el),3) * 65}ms`);
          reveal.observe(el);
        }
      });
    }
  }
  // Uma aba invisível não precisa continuar animando.
  const syncVisibility = () => root.classList.toggle('document-hidden', document.hidden);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();

  // Indicador de leitura: um único ciclo por quadro, sem bloquear o scroll.
  const progress = document.querySelector('[data-scroll-progress]');
  const header = document.querySelector('.site-header');
  let scrollQueued = false;
  const renderScroll = () => {
    const range = root.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${range > 0 ? Math.min(1,Math.max(0,scrollY/range)) : 0})`;
    if (header) header.classList.toggle('is-scrolled', scrollY > 12);
    scrollQueued = false;
  };
  const requestScroll = () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(renderScroll); } };
  addEventListener('scroll', requestScroll, {passive:true});
  addEventListener('resize', requestScroll, {passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(requestScroll).observe(document.body);
  renderScroll();

  // Apenas a composição decorativa reage ao ponteiro. Nada substitui o cursor do sistema.
  document.querySelectorAll('[data-tilt]').forEach(art => {
    let queued = false, px=0, py=0;
    art.addEventListener('pointermove', event => {
      if (!motionAllowed() || !finePointer.matches) return;
      const box=art.getBoundingClientRect();
      px=(event.clientX-box.left)/box.width-.5; py=(event.clientY-box.top)/box.height-.5;
      if (!queued) { queued=true; requestAnimationFrame(() => {
        queued=false;
        if (!motionAllowed()) return;
        art.style.setProperty('--tilt-x', `${(px*5).toFixed(2)}deg`);
        art.style.setProperty('--tilt-y', `${(-py*5).toFixed(2)}deg`);
      }); }
    }, {passive:true});
    art.addEventListener('pointerleave', () => { art.style.removeProperty('--tilt-x'); art.style.removeProperty('--tilt-y'); });
  });

  // Uma recomendação editorial simples, transparente e sem pontuação inventada.
  const directions = {
  "gestao": {
    "title": "Sua marca precisa entrar na conversa.",
    "service": "Gestão de redes sociais",
    "copy": "Planejamento e criação para apresentar suas soluções com constância, responder dúvidas e dar às pessoas motivos para conhecer seu negócio.",
    "cta": "Conhecer os planos",
    "objective": "Quero que mais pessoas conheçam meu negócio e encontrem motivos para entrar em contato."
  },
  "reels": {
    "title": "Mostre o valor do que você faz.",
    "service": "Produção de Reels",
    "copy": "Roteiro, gravação e edição para apresentar seus produtos, serviços e diferenciais em vídeo. Uma forma de dar contexto à sua oferta e despertar interesse.",
    "cta": "Explorar os pacotes de Reels",
    "objective": "Quero despertar interesse pelos meus produtos e serviços com vídeos e Reels."
  },
  "criacao": {
    "title": "Deixe sua oferta mais clara.",
    "service": "Design e conteúdo",
    "copy": "Peças para campanhas, redes e apresentações que expressem sua identidade, destaquem seus diferenciais e mostrem o que você oferece.",
    "cta": "Ver opções de criação",
    "objective": "Quero valorizar o que minha marca oferece e comunicar melhor meus diferenciais."
  },
  "fotografia": {
    "title": "Seu evento pode continuar contando histórias.",
    "service": "Fotografia de eventos",
    "copy": "Registre a experiência e tenha imagens para compartilhar com quem participou e com quem ainda precisa conhecer sua marca. Entregas e cobertura são alinhadas na proposta.",
    "cta": "Conhecer a cobertura",
    "objective": "Quero registrar e divulgar meu evento com imagens que apresentem a experiência e minha marca."
  }
};
  document.querySelectorAll('[data-finder]').forEach(finder => {
    const choices = Array.from(finder.querySelectorAll('[data-goal]'));
    const result = finder.querySelector('.finder-result');
    if (!result) return;
    result.hidden=false;
    choices.forEach(choice => {
      // Links funcionam sem JS; com JS tornam-se seletores com estado anunciado.
      choice.setAttribute('role','button'); choice.setAttribute('aria-pressed','false');
      choice.setAttribute('aria-controls','finder-result');
      result.id='finder-result';
      const select = event => {
        event.preventDefault();
        const key=choice.dataset.goal, info=directions[key];
        if (!info) return;
        choices.forEach(button=>button.setAttribute('aria-pressed',String(button===choice)));
        finder.querySelector('[data-finder-kicker]').textContent=info.service;
        finder.querySelector('[data-finder-title]').textContent=info.title;
        finder.querySelector('[data-finder-copy]').textContent=info.copy;
        const link=finder.querySelector('[data-finder-cta]');
        link.textContent=info.cta+' ↗'; link.href=`servicos.html#${key}`;
        finder.querySelector('[data-finder-contact]').href=`contato.html?servico=${key}&objetivo=${encodeURIComponent(info.objective)}`;
        finder.querySelector('.finder-result-actions').hidden=false;
        finder.querySelector('[data-finder-status]').textContent=`Sugestão: ${info.service}. ${info.title} Os links para continuar estão abaixo das opções.`;
        result.classList.remove('is-changing');
        if (motionAllowed()) requestAnimationFrame(() => result.classList.add('is-changing'));
        requestScroll();
      };
      choice.addEventListener('click',select);
      choice.addEventListener('keydown',event=>{if (event.key===' ') select(event);});
    });
  });

  // Padrão de tabs: seleção manual/teclado, painéis estáveis e sem avanço automático.
  document.querySelectorAll('[data-process]').forEach(widget => {
    const list=widget.querySelector('.process-tabs');
    const tabs=Array.from(widget.querySelectorAll('.process-tab'));
    const panels=Array.from(widget.querySelectorAll('.process-panel'));
    if (!list || tabs.length!==panels.length) return;
    list.setAttribute('role','tablist');
    const select = (index,focus=false) => {
      tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
      panels.forEach((panel,i)=>{
        panel.hidden=i!==index;
        panel.classList.remove('panel-enter');
        if (i===index && motionAllowed()) panel.classList.add('panel-enter');
      });
      if (focus) tabs[index].focus();
      requestScroll();
    };
    tabs.forEach((tab,i)=>{
      tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panels[i].id);
      panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',tab.id);panels[i].tabIndex=0;
      tab.addEventListener('click',event=>{event.preventDefault();select(i);});
      tab.addEventListener('keydown',event=>{
        let next;
        if(event.key==='ArrowRight')next=(i+1)%tabs.length;
        if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
        if(event.key==='Home')next=0;
        if(event.key==='End')next=tabs.length-1;
        if(event.key===' ')next=i;
        if(next!==undefined){event.preventDefault();select(next,true);}
      });
    });
    const target=window.__MALHADO_HASH || window.location.hash;
    const initial=panels.findIndex(panel=>`#${panel.id}`===target);
    select(initial>=0?initial:0);
    addEventListener('hashchange',()=>{
      const index=panels.findIndex(panel=>`#${panel.id}`===location.hash);
      if(index>=0)select(index);
    });
  });
})();
