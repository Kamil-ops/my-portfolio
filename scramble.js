(function () {
  'use strict';

  const CHARS = '!<>-_\\/[]{}—=+*^?#';

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.original = el.textContent.trim();
      this.rafId = null;
      this.update = this.update.bind(this);
    }

    run() {
      this.queue = this.original.split('').map((ch, i) => ({
        ch,
        end: Math.floor(Math.random() * 12) + 4 + i * 2,
        current: null
      }));
      this.frame = 0;
      cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(this.update);
    }

    reset() {
      cancelAnimationFrame(this.rafId);
      this.el.textContent = this.original;
    }

    update() {
      let out = '';
      let done = 0;
      for (const item of this.queue) {
        if (this.frame >= item.end) {
          done++;
          out += item.ch;
        } else {
          if (!item.current || Math.random() < 0.28) {
            item.current = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          out += item.current;
        }
      }
      this.el.textContent = out;
      if (done < this.queue.length) {
        this.frame++;
        this.rafId = requestAnimationFrame(this.update);
      }
    }
  }

  function init() {
    const els = [
      ...document.querySelectorAll('a.nav-logo'),
      ...document.querySelectorAll('.nav-links a:not([class*="btn"])')
    ];
    for (const el of els) {
      const fx = new TextScramble(el);
      el.addEventListener('mouseenter', () => fx.run());
      el.addEventListener('mouseleave', () => fx.reset());
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
