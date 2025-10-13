(function () {
  const params = new URLSearchParams(location.search);
  const lang = params.get('lang') || (location.pathname.includes('/zh_CN/') ? 'zh_CN' : 'en');
  const $ = (s) => document.querySelector(s);
  const content = $('#content');

  function getMap() {
    const isPrivacy = location.pathname.endsWith('/privacy.html');
    if (isPrivacy) {
      return { en: '../PRIVACY.en.md', zh_CN: '../PRIVACY.md' };
    }
    return { en: '../TERMS.en.md', zh_CN: '../TERMS.md' };
  }

  function setTitle() {
    const isPrivacy = location.pathname.endsWith('/privacy.html');
    document.title = isPrivacy
      ? (lang === 'zh_CN' ? '隐私政策' : 'Privacy Policy')
      : (lang === 'zh_CN' ? '用户使用协议' : 'Terms of Use');
  }

  async function render() {
    setTitle();
    const map = getMap();
    const file = map[lang] || map.en;
    const basePrefix = lang === 'zh_CN' ? '/zh_CN' : '/en';
    const backHref = `../index.html#/${location.pathname.endsWith('/privacy.html') ? 'privacy' : 'terms'}?lang=${lang}`;
    $('#back-link').setAttribute('href', backHref);
    const res = await fetch(file);
    const txt = await res.text();
    content.innerHTML = marked.parse(txt);
  }

  render();
})();
