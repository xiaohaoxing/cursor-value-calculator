(function () {
  const $ = (s) => document.querySelector(s);
  const content = $('#content');
  const langSelect = $('#lang');
  const navPrivacy = $('#nav-privacy');
  const navTerms = $('#nav-terms');

  const supported = ['en', 'zh_CN'];
  function getDefaultLang() {
    try {
      const n = navigator.language || 'en';
      if (n.toLowerCase().startsWith('zh')) return 'zh_CN';
      return 'en';
    } catch { return 'en'; }
  }

  function getLang() {
    const u = new URLSearchParams(location.search);
    const q = u.get('lang');
    if (q && supported.includes(q)) return q;
    const s = localStorage.getItem('docs_lang');
    if (s && supported.includes(s)) return s;
    return getDefaultLang();
  }

  function setLang(l) {
    localStorage.setItem('docs_lang', l);
    langSelect.value = l;
  }

  function t(key) {
    const dict = {
      en: { privacy: 'Privacy Policy', terms: 'Terms of Use', language: 'Language' },
      zh_CN: { privacy: '隐私政策', terms: '用户使用协议', language: '语言' }
    };
    const l = getLang();
    return (dict[l] && dict[l][key]) || (dict.en && dict.en[key]) || key;
  }

  function updateNavActive(route) {
    [navPrivacy, navTerms].forEach(a => a.classList.remove('active'));
    if (route === 'privacy') navPrivacy.classList.add('active');
    if (route === 'terms') navTerms.classList.add('active');
    navPrivacy.textContent = t('privacy');
    navTerms.textContent = t('terms');
    document.title = route === 'terms' ? t('terms') : t('privacy');
  }

  async function loadMarkdown(route, lang) {
    const map = {
      privacy: { en: 'PRIVACY.en.md', zh_CN: 'PRIVACY.md' },
      terms: { en: 'TERMS.en.md', zh_CN: 'TERMS.md' }
    };
    const file = map[route]?.[lang] || map[route]?.en;
    const url = `../${file}`;
    const res = await fetch(url);
    const txt = await res.text();
    content.innerHTML = marked.parse(txt);
  }

  async function render() {
    const hash = location.hash.replace(/^#\//, '') || 'privacy';
    const route = (hash === 'terms') ? 'terms' : 'privacy';
    const lang = getLang();
    setLang(lang);
    updateNavActive(route);
    await loadMarkdown(route, lang);
  }

  window.addEventListener('hashchange', render);
  langSelect.addEventListener('change', () => {
    const l = langSelect.value;
    setLang(l);
    render();
  });

  render();
})();
