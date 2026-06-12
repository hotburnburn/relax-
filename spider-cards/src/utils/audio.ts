let audioCtx: AudioContext | null = null;
let isMuted = false;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // @ts-ignore - Support old browsers just in case
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const toggleMute = (): boolean => {
  isMuted = !isMuted;
  return isMuted;
};

export const getMutedStatus = (): boolean => {
  return isMuted;
};

// Play a short tick sound (used for dealing individually or shuffling)
export const playCardTick = (delay = 0, frequency = 800, duration = 0.04) => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
  // Frequency sweep downwards to simulate a click/rustle
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + delay + duration);

  gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
};

// Shuffle sound: a rapid series of ticks
export const playShuffleSound = () => {
  if (isMuted) return;
  for (let i = 0; i < 8; i++) {
    playCardTick(i * 0.07, 600 - i * 30, 0.05);
  }
};

// Deal sound: 10 quick ticks
export const playDealSound = () => {
  if (isMuted) return;
  for (let i = 0; i < 10; i++) {
    playCardTick(i * 0.05, 500 + i * 20, 0.04);
  }
};

// Flip sound: a low frequency rustle
export const playFlipSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
};

// Move sound: a swoosh
export const playMoveSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

  // Add a bandpass filter to make it sound like a swoosh
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 500;
  filter.Q.value = 2.0;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

// Complete run: beautiful chime
export const playCompleteRunSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Play an ascending major arpeggio (C major: C4, E4, G4, C5)
  const notes = [261.63, 329.63, 392.00, 523.25];

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.12);
    
    gain.gain.setValueAtTime(0.0, now + index * 0.12);
    gain.gain.linearRampToValueAtTime(0.15, now + index * 0.12 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.12);
    osc.stop(now + index * 0.12 + 0.5);
  });
};

// Victory sound: a short fanfare
export const playVictorySound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C4, E4, G4, C5 (arpeggio), then a chord at the end
  const chords = [
    { time: 0.0, notes: [261.63] },
    { time: 0.15, notes: [329.63] },
    { time: 0.3, notes: [392.00] },
    { time: 0.45, notes: [523.25] },
    { time: 0.7, notes: [329.63, 392.00, 523.25, 659.25] } // C major chord
  ];

  chords.forEach((chord) => {
    chord.notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + chord.time);

      gain.gain.setValueAtTime(0.0, now + chord.time);
      gain.gain.linearRampToValueAtTime(0.1, now + chord.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + chord.time);
      osc.stop(now + chord.time + 0.8);
    });
  });
};
