export class AudioEngine {
  constructor() {
    this.settings = { music: .35, sfx: .65, mute: false }; this.context = null; this.suspended = false; this.step = 0; this.nextBeat = 0;
  }
  unlock() {
    try {
      if (!this.context) {
        const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Context) return;
        this.context = new Context();
        this.master = this.context.createGain(); this.master.connect(this.context.destination);
        this.music = this.context.createGain(); this.music.connect(this.master);
        this.effects = this.context.createGain(); this.effects.connect(this.master);
        this.engine = this.context.createOscillator(); this.engine.type = 'triangle';
        this.engineGain = this.context.createGain(); this.engineGain.gain.value = 0;
        this.engine.connect(this.engineGain); this.engineGain.connect(this.effects); this.engine.start();
        this.setSettings(this.settings); this.nextBeat = this.context.currentTime;
        this.timer = setInterval(() => this.sequence(), 100);
      }
      this.context.resume().catch(() => {});
    } catch {}
  }
  setSettings(settings) {
    Object.assign(this.settings, settings);
    if (!this.context) return;
    const t = this.context.currentTime;
    this.master.gain.setTargetAtTime(this.settings.mute ? 0 : .6, t, .05);
    this.music.gain.setTargetAtTime(this.settings.music ?? .35, t, .05);
    this.effects.gain.setTargetAtTime(this.settings.sfx ?? .65, t, .05);
  }
  tone(frequency, duration, type = 'sine', volume = .2, start, destination, endFrequency) {
    if (!this.context || this.suspended) return;
    const time = start ?? this.context.currentTime;
    const osc = this.context.createOscillator(), gain = this.context.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency, time);
    if (endFrequency) osc.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
    gain.gain.setValueAtTime(.0001, time); gain.gain.exponentialRampToValueAtTime(Math.max(.001, volume), time + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    osc.connect(gain); gain.connect(destination || this.effects); osc.start(time); osc.stop(time + duration + .01);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  sequence() {
    if (!this.context || this.context.state !== 'running' || this.suspended) return;
    if (this.nextBeat < this.context.currentTime - .5) this.nextBeat = this.context.currentTime;
    const melody = [0, 7, 12, 7, 4, 9, 16, 12, 2, 7, 14, 9, 5, 12, 17, 14];
    const roots = [48, 45, 53, 55];
    while (this.nextBeat < this.context.currentTime + .15) {
      const step = this.step++;
      const root = roots[Math.floor(step / 16) % roots.length];
      const hz = midi => 440 * 2 ** ((midi - 69) / 12);
      this.tone(hz(root + 12 + melody[step % 16]), .19, 'triangle', .12, this.nextBeat, this.music);
      if (step % 4 === 0) { this.tone(hz(root - 12), .35, 'sine', .26, this.nextBeat, this.music); this.tone(115, .1, 'sine', .15, this.nextBeat, this.music, 38); }
      if (step % 4 === 2) this.tone(850, .035, 'triangle', .045, this.nextBeat, this.music, 240);
      this.nextBeat += 60 / 118 / 4;
    }
  }
  update(speed, drifting) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const velocity = Math.max(0, Math.min(1, Math.abs(speed) > 1 ? Math.abs(speed) / 100 : Math.abs(speed)));
    this.engine.frequency.setTargetAtTime(55 + velocity * 165, t, .08);
    this.engineGain.gain.setTargetAtTime(this.suspended ? 0 : .018 + velocity * .035, t, .08);
    if (drifting && t > (this.nextSkid || 0)) { this.tone(290 + Math.random() * 100, .05, 'sawtooth', .012); this.nextSkid = t + .1; }
  }
  sfx(name) {
    if (!this.context || this.suspended) return;
    const t = this.context.currentTime;
    if (['boost', 'turbo', 'drift'].includes(name)) this.tone(120, .4, 'sawtooth', .14, t, null, 650);
    else if (['hit', 'crash', 'collision'].includes(name)) { this.tone(110, .23, 'square', .15, t, null, 35); this.tone(175, .15, 'triangle', .14); }
    else if (['countdown', 'count', 'tick'].includes(name)) this.tone(440, .15, 'sine', .3);
    else if (['go', 'start'].includes(name)) this.tone(880, .4, 'triangle', .28);
    else if (['finish', 'win', 'lap'].includes(name)) [0, 4, 7, 12].forEach((note, i) => this.tone(440 * 2 ** (note / 12), .4, 'triangle', .24, t + i * .11));
    else if (['item', 'pickup', 'collect', 'coin'].includes(name)) { this.tone(660, .12, 'sine', .22); this.tone(990, .19, 'sine', .18, t + .075); }
    else if (name === 'shield') [440, 554, 660].forEach(hz => this.tone(hz, .45, 'sine', .1, t));
    else if (name === 'jump') this.tone(200, .22, 'triangle', .16, t, null, 700);
    else if (name === 'land') this.tone(95, .16, 'triangle', .24, t, null, 38);
    else if (name === 'recover') [660, 440, 550, 880].forEach((hz, i) => this.tone(hz, .2, 'sine', .13, t + i * .09));
    else this.tone(520, .08, 'triangle', .16);
  }
  pause() { this.suspended = true; if (this.engineGain) this.engineGain.gain.setTargetAtTime(0, this.context.currentTime, .04); }
  resume() { this.suspended = false; this.unlock(); }
}
