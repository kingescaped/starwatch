export type UiSoundKind = 'tap' | 'tab' | 'select' | 'theme' | 'tick' | 'success';

let soundEnabled = true;
let sharedAudioCtx: AudioContext | null = null;
let lastTickMs = 0;

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctor();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  durationSec: number,
  gainPeak: number,
  delaySec = 0,
  type: OscillatorType = 'sine'
): void {
  const start = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + durationSec + 0.02);
}

export function playUiSound(kind: UiSoundKind): void {
  if (!soundEnabled) return;
  if (kind === 'tick') {
    const now = Date.now();
    if (now - lastTickMs < 45) return;
    lastTickMs = now;
  }
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (kind === 'tick') {
      playTone(ctx, 880, 0.028, 0.025, 0, 'triangle');
    } else if (kind === 'tap') {
      playTone(ctx, 560, 0.045, 0.032, 0, 'sine');
    } else if (kind === 'tab') {
      playTone(ctx, 520, 0.06, 0.035, 0, 'sine');
      playTone(ctx, 740, 0.08, 0.028, 0.03, 'sine');
    } else if (kind === 'select') {
      playTone(ctx, 640, 0.065, 0.035, 0, 'triangle');
      playTone(ctx, 960, 0.09, 0.03, 0.035, 'sine');
    } else if (kind === 'theme') {
      playTone(ctx, 440, 0.09, 0.035, 0, 'sine');
      playTone(ctx, 660, 0.12, 0.03, 0.045, 'sine');
    } else if (kind === 'success') {
      playTone(ctx, 587.33, 0.08, 0.035, 0, 'sine');
      playTone(ctx, 783.99, 0.1, 0.035, 0.055, 'sine');
      playTone(ctx, 1046.5, 0.16, 0.032, 0.11, 'sine');
    }
  } catch {
    // Ignore audio context errors when browser blocks autoplay
  }
}
