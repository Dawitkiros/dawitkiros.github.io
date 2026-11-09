(() => {
  const themeButton = document.querySelector('.theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark' : prefersDark.matches;
  const updateThemeLabel = () => themeButton?.setAttribute('aria-label', `Switch to ${isDark() ? 'light' : 'dark'} theme`);
  updateThemeLabel();
  prefersDark.addEventListener('change', updateThemeLabel);
  themeButton?.addEventListener('click', () => {
    const theme = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('color-theme', theme); } catch (_) { /* Theme still works for this page. */ }
    updateThemeLabel();
  });
  const filters = document.querySelectorAll('[data-filter]');
  const papers = document.querySelectorAll('[data-topics]');
  if (filters.length) {
    const topics = new Set([...filters].map(filter => filter.dataset.filter));
    const topicFromURL = () => {
      const topic = new URL(location.href).searchParams.get('topic');
      return topics.has(topic) ? topic : 'all';
    };
    const applyTopic = topic => {
      filters.forEach(filter => {
        const selected = filter.dataset.filter === topic;
        filter.classList.toggle('is-active', selected);
        filter.setAttribute('aria-pressed', String(selected));
      });
      let count = 0;
      papers.forEach(paper => {
        const paperTopics = (paper.dataset.topics || '').split(/\s+/);
        paper.hidden = topic !== 'all' && !paperTopics.includes(topic);
        if (!paper.hidden) count++;
      });
      document.querySelector('.filter-count').textContent = `${count} publication${count === 1 ? '' : 's'}`;
    };
    filters.forEach(button => button.addEventListener('click', () => {
      const topic = button.dataset.filter;
      const url = new URL(location.href);
      if (topic === 'all') url.searchParams.delete('topic');
      else url.searchParams.set('topic', topic);
      if (url.href !== location.href) history.pushState(null, '', url);
      applyTopic(topic);
    }));
    addEventListener('popstate', () => applyTopic(topicFromURL()));
    addEventListener('pageshow', () => applyTopic(topicFromURL()));
    applyTopic(topicFromURL());
  }
  const navLinks = document.querySelectorAll('.main-nav a');
  const sections = [...navLinks].map(link => document.getElementById(new URL(link.href).hash.slice(1))).filter(Boolean);
  if (sections.length) {
    let scheduled = false;
    const updateNavigation = () => {
      const threshold = document.querySelector('.site-header').getBoundingClientRect().height + 100;
      let current = sections.filter(section => section.getBoundingClientRect().top <= threshold).pop();
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) current = sections[sections.length - 1];
      navLinks.forEach(link => {
        if (current && new URL(link.href).hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      scheduled = false;
    };
    const scheduleUpdate = () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
    };
    addEventListener('scroll', scheduleUpdate, { passive: true });
    addEventListener('resize', scheduleUpdate);
    updateNavigation();
  }
})();
