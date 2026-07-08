// A gentle tinging chime — three soft sine tones stacked into a bright E-major
// triad, ~500ms total. Bright enough to feel affirming, sine-only so it doesn't
// bite. Synthesized live via Web Audio — no bundled audio.

let audioCtx = null

function ensureCtx() {
  if (audioCtx) return audioCtx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  audioCtx = new AC()
  return audioCtx
}

function soundOn() {
  return localStorage.getItem('asmaa.sound') !== 'off'
}

export function setSoundEnabled(on) {
  localStorage.setItem('asmaa.sound', on ? 'on' : 'off')
}
export function isSoundEnabled() {
  return soundOn()
}

export function playChime() {
  if (!soundOn()) return
  const ctx = ensureCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})

  const now = ctx.currentTime
  const DUR = 0.55

  const out = ctx.createGain()
  out.gain.value = 0.32
  out.connect(ctx.destination)

  // Rising E-major triad — arrival of E5, G#5, B5 overlaps to form a chord.
  // Each note: near-instant attack (8ms) so there's no perceived delay,
  // exponential decay to silence.
  const notes = [
    { freq: 659.25, delay: 0.00, peak: 0.60 }, // E5
    { freq: 830.61, delay: 0.05, peak: 0.50 }, // G#5
    { freq: 987.77, delay: 0.10, peak: 0.40 }, // B5
  ]

  for (const n of notes) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = n.freq

    const env = ctx.createGain()
    const startAt = now + n.delay
    const endAt = now + DUR
    env.gain.setValueAtTime(0, startAt)
    env.gain.linearRampToValueAtTime(n.peak, startAt + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, endAt)

    osc.connect(env)
    env.connect(out)
    osc.start(startAt)
    osc.stop(endAt + 0.05)
  }
}

// Longer, richer chime for completing a whole bouquet or hitting a milestone.
// A rising E-major arpeggio with soft bell texture, ~1.8 seconds total.
export function playMilestoneChime() {
  if (!soundOn()) return
  const ctx = ensureCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})

  const now = ctx.currentTime
  const DUR = 1.8

  const out = ctx.createGain()
  out.gain.value = 0.28
  out.connect(ctx.destination)

  // Rising arpeggio: E5 · G#5 · B5 · E6 · G#6 — full E-major climb
  const notes = [
    { freq: 659.25, delay: 0.00, peak: 0.55 }, // E5
    { freq: 830.61, delay: 0.09, peak: 0.50 }, // G#5
    { freq: 987.77, delay: 0.18, peak: 0.45 }, // B5
    { freq: 1318.5, delay: 0.28, peak: 0.40 }, // E6
    { freq: 1661.2, delay: 0.40, peak: 0.32 }, // G#6 (sparkle)
  ]

  for (const n of notes) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = n.freq

    const env = ctx.createGain()
    const startAt = now + n.delay
    const endAt = now + DUR
    env.gain.setValueAtTime(0, startAt)
    env.gain.linearRampToValueAtTime(n.peak, startAt + 0.012)
    env.gain.exponentialRampToValueAtTime(0.0001, endAt)

    osc.connect(env)
    env.connect(out)
    osc.start(startAt)
    osc.stop(endAt + 0.05)
  }
}
