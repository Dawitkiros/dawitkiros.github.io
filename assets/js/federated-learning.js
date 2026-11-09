(() => {
  const root = document.getElementById('federated-learning');
  if (!root) return;

  const clients = [...root.querySelectorAll('[data-fl-client]')];
  const models = [...root.querySelectorAll('[data-fl-model]')];
  const wires = [...root.querySelectorAll('[data-fl-wire]')];
  const packets = [...root.querySelectorAll('[data-fl-packet]')];
  const server = root.querySelector('[data-fl-server]');
  const control = root.querySelector('.fl-control');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const center = { x: 160, y: 130 };
  const points = clients.map(client => ({ x: Number(client.dataset.x), y: Number(client.dataset.y) }));
  const selections = [[0, 2, 4], [1, 3, 5], [6, 0, 3], [1, 4, 6], [2, 4, 5]];
  const stages = [350, 400, 650, 450, 650];
  const roundLength = stages.reduce((sum, length) => sum + length, 0);
  const finalLength = 1200;
  const duration = selections.length * roundLength + finalLength;
  const mix = (a, b, p) => a.map((value, i) => value + (b[i] - value) * p);
  const mean = colors => colors[0].map((_, i) => colors.reduce((sum, color) => sum + color[i], 0) / colors.length);
  const ease = value => {
    const p = Math.max(0, Math.min(1, value));
    return p * p * (3 - 2 * p);
  };
  const rgb = color => `rgb(${color.map(value => Math.round(value)).join(',')})`;

  let timeline = [];
  let time = 0;
  let running = false;
  let inView = false;
  let userPaused = false;
  let frameId = null;
  let lastFrame = null;

  function buildTimeline() {
    const style = getComputedStyle(root);
    let colors = models.map((_, i) => {
      const hex = style.getPropertyValue(`--fl-color-${i + 1}`).trim().replace('#', '');
      return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
    });
    let global = [255, 255, 255];
    timeline = selections.map(selected => {
      const nextGlobal = mean(selected.map(i => colors[i]));
      const end = colors.map((color, i) => selected.includes(i) ? nextGlobal : color);
      const round = { selected, start: colors, global, nextGlobal, end };
      colors = end;
      global = nextGlobal;
      return round;
    });
  }

  function derive() {
    const last = timeline[timeline.length - 1];
    if (time >= duration) {
      return { colors: models.map(() => last.nextGlobal), global: last.nextGlobal, selected: [], phase: 'complete', flow: null, p: 1 };
    }
    if (time >= roundLength * selections.length) {
      const p = ease((time - roundLength * selections.length) / finalLength);
      return { colors: last.end.map(color => mix(color, last.nextGlobal, ease((p - .5) * 2))), global: last.nextGlobal, selected: [], phase: 'synchronize', flow: 'all', p };
    }
    const index = Math.floor(time / roundLength);
    const round = timeline[index];
    let elapsed = time - index * roundLength;
    let stage = 0;
    while (stage < stages.length - 1 && elapsed >= stages[stage]) {
      elapsed -= stages[stage];
      stage++;
    }
    const p = ease(elapsed / stages[stage]);
    let colors = round.start;
    let global = round.global;
    if (stage === 3) global = mix(round.global, round.nextGlobal, p);
    if (stage === 4) {
      global = round.nextGlobal;
      colors = round.start.map((color, i) => round.selected.includes(i) ? mix(color, global, ease((p - .5) * 2)) : color);
    }
    return { colors, global, selected: round.selected, phase: ['select', 'prepare', 'upload', 'mix', 'return'][stage], flow: stage === 2 ? 'in' : stage === 4 ? 'out' : null, p };
  }

  function render() {
    const state = derive();
    const ready = time === 0 && !running;
    models.forEach((model, i) => {
      const selected = !ready && state.selected.includes(i);
      model.setAttribute('fill', rgb(state.colors[i]));
      clients[i].classList.toggle('is-selected', selected);
      wires[i].setAttribute('opacity', selected || state.flow === 'all' ? .8 : .25);
      const flowing = state.flow && (selected || state.flow === 'all');
      packets[i].setAttribute('opacity', flowing && state.p > 0 && state.p < 1 ? 1 : 0);
      if (flowing) {
        const p = state.flow === 'in' ? 1 - state.p : state.p;
        const x = center.x + (points[i].x - center.x) * p;
        const y = center.y + (points[i].y - center.y) * p;
        packets[i].setAttribute('transform', `translate(${x},${y})`);
        packets[i].setAttribute('fill', rgb(state.flow === 'in' ? state.colors[i] : state.global));
      }
    });
    server.setAttribute('fill', rgb(state.global));
    root.dataset.phase = ready ? 'ready' : state.phase;
    root.dataset.selected = ready ? '' : state.selected.join(',');
    const action = running ? 'pause' : time >= duration ? 'replay' : 'play';
    control.dataset.action = action;
    control.setAttribute('aria-label', `${action === 'pause' ? 'Pause' : action === 'replay' ? 'Replay' : 'Play'} animation`);
    control.hidden = reducedMotion.matches;
  }

  function tick(now) {
    if (!running) return;
    if (lastFrame !== null) time = Math.min(duration, time + Math.min(now - lastFrame, 100));
    lastFrame = now;
    if (time >= duration) {
      running = false;
      lastFrame = null;
    }
    render();
    if (running) frameId = requestAnimationFrame(tick);
  }

  function reconcilePlayback() {
    const shouldRun = inView && !document.hidden && !userPaused && !reducedMotion.matches && time < duration;
    if (shouldRun === running) return;
    running = shouldRun;
    lastFrame = null;
    if (running) frameId = requestAnimationFrame(tick);
    else cancelAnimationFrame(frameId);
    render();
  }

  control.addEventListener('click', () => {
    if (time >= duration) {
      time = 0;
      userPaused = false;
    } else {
      userPaused = running;
    }
    reconcilePlayback();
    render();
  });
  document.addEventListener('visibilitychange', reconcilePlayback);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) time = duration;
    reconcilePlayback();
    render();
  });
  const refreshColors = () => { buildTimeline(); render(); };
  darkScheme.addEventListener('change', refreshColors);
  new MutationObserver(refreshColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  buildTimeline();
  if (reducedMotion.matches) time = duration;
  render();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      reconcilePlayback();
    }, { threshold: .1 }).observe(root);
  } else {
    inView = true;
    reconcilePlayback();
  }
})();
