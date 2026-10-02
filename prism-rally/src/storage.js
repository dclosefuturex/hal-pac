const KEY = 'prism-rally-save-v1';
export const defaults = () => ({ version: 1, settings: { music: .35, sfx: .65, mute: false, reducedShake: false, reducedFlash: false }, records: {}, unlocks: [0], medals: {} });
const finite = (n) => typeof n === 'number' && Number.isFinite(n);
const safeKey = key => typeof key === 'string' && /^[\w:-]{1,100}$/.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key);
export function validateSave(raw) {
  const clean = defaults();
  if (!raw || typeof raw !== 'object' || raw.version !== 1) return clean;
  if (raw.settings && typeof raw.settings === 'object') {
    for (const key of ['music', 'sfx']) if (finite(raw.settings[key])) clean.settings[key] = Math.max(0, Math.min(1, raw.settings[key]));
    for (const key of ['mute', 'reducedShake', 'reducedFlash']) if (typeof raw.settings[key] === 'boolean') clean.settings[key] = raw.settings[key];
  }
  if (Array.isArray(raw.unlocks)) clean.unlocks = [...new Set([0, ...raw.unlocks.filter(x => Number.isInteger(x) && x >= 0 && x < 3)])];
  if (raw.medals && typeof raw.medals === 'object') for (const [key, value] of Object.entries(raw.medals)) {
    if (safeKey(key) && Number.isInteger(value) && value >= 1 && value <= 3) clean.medals[key] = value;
  }
  if (raw.records && typeof raw.records === 'object') for (const [key, value] of Object.entries(raw.records).slice(0, 100)) {
    if (!safeKey(key) || !value || !finite(value.time) || value.time <= 0 || value.time > 86400) continue;
    const ghost = Array.isArray(value.ghost) ? value.ghost.slice(0, 36000).filter(frame => Array.isArray(frame) && frame.length === 5 && frame.every(finite)).map(frame => frame.slice()) : [];
    clean.records[key] = { time: value.time, ghost };
  }
  return clean;
}
export function loadSave() {
  try { return validateSave(JSON.parse(globalThis.localStorage.getItem(KEY))); } catch { return defaults(); }
}
export function saveGame(data) {
  try { globalThis.localStorage.setItem(KEY, JSON.stringify(validateSave(data))); return true; } catch { return false; }
}
export function recordTrial(save, key, time, ghost = []) {
  if (!finite(time) || time <= 0 || !safeKey(key)) return false;
  if (save.records[key] && save.records[key].time <= time) return false;
  save.records[key] = { time, ghost: JSON.parse(JSON.stringify(ghost)) };
  saveGame(save);
  return true;
}
export function awardCup(save, cupId, place) {
  if (!Number.isInteger(place) || place < 1 || place > 3) return false;
  const id = String(cupId);
  if (!safeKey(id)) return false;
  save.medals[id] = Math.min(save.medals[id] || 4, place);
  const next = Number(cupId) + 1;
  if (Number.isInteger(next) && next > 0 && next < 3 && !save.unlocks.includes(next)) save.unlocks.push(next);
  saveGame(save);
  return true;
}
