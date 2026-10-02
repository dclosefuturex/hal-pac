const controlled = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyE', 'Escape', 'KeyR']);
const menuTarget = target => /INPUT|TEXTAREA|SELECT/.test(target?.tagName) || (target?.closest?.('button, a, [role="button"]') && !target?.closest?.('[data-control]'));
export class Input {
  constructor() {
    this.keys = new Set(); this.touch = {}; this.previous = {}; this.edges = {}; this.pointers = new Map();
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', event => {
      if (menuTarget(event.target) && event.code !== 'Escape') return;
      if (controlled.has(event.code)) event.preventDefault();
      if(!this.keys.has(event.code)){const edge={KeyE:'item',Escape:'pause',KeyR:'recover'}[event.code];if(edge)this.edges[edge]=true}this.keys.add(event.code);
    });
    window.addEventListener('keyup', event => { this.keys.delete(event.code); if (!menuTarget(event.target) && controlled.has(event.code)) event.preventDefault(); });
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });
    document.addEventListener('pointerdown', event => {
      const target = event.target.closest?.('[data-control]');
      if (!target) return;
      event.preventDefault(); this.pointers.set(event.pointerId, target.dataset.control); this.touch[target.dataset.control] = true;if(['item','pause','recover'].includes(target.dataset.control))this.edges[target.dataset.control]=true;
      target.setPointerCapture?.(event.pointerId);
    });
    const release = event => {
      const control = this.pointers.get(event.pointerId); this.pointers.delete(event.pointerId);
      if (control) this.touch[control] = [...this.pointers.values()].includes(control);
    };
    document.addEventListener('pointerup', release); document.addEventListener('pointercancel', release);
  }
  clear() { this.keys.clear(); this.touch = {}; this.previous = {}; this.edges={}; this.pointers.clear(); }
  sample() {
    const down = (...keys) => keys.some(k => this.keys.has(k));
    let pads = []; try { pads = navigator.getGamepads?.() || []; } catch {}
    const pad = Array.from(pads).find(p => p && p.connected);
    const button = n => pad?.buttons[n]?.value || 0;
    const axis = pad?.axes[0] || 0;
    const steer = (down('KeyD', 'ArrowRight') || this.touch.right ? 1 : 0) - (down('KeyA', 'ArrowLeft') || this.touch.left ? 1 : 0);
    const result = {
      throttle: Math.max(down('KeyW', 'ArrowUp') || this.touch.throttle || this.touch.accelerate ? 1 : 0, button(7), button(0)),
      brake: Math.max(down('KeyS', 'ArrowDown') || this.touch.brake ? 1 : 0, button(6), button(1)),
      steer: steer || (Math.abs(axis) > .14 ? axis : 0) || (button(15) - button(14)),
      drift: !!(down('Space') || this.touch.drift || button(5) > .5),
      item: !!(down('KeyE') || this.touch.item || button(2) > .5),
      pause: !!(down('Escape') || this.touch.pause || button(9) > .5),
      recover: !!(down('KeyR') || this.touch.recover || button(3) > .5),
    };
    for (const key of ['item', 'pause', 'recover']) { const held = result[key]; result[key] = (held && !this.previous[key]) || !!this.edges[key];this.edges[key]=false; this.previous[key] = held; }
    return result;
  }
}
