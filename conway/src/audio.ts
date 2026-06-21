// Audio synthesizer utilizing the Web Audio API for custom gameplay feedback
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private echoDelay: DelayNode | null = null;
  private echoFeedback: GainNode | null = null;
  private masterVolume: GainNode | null = null;

  // Major Pentatonic scale frequencies starting from C3 (130.81Hz)
  private pentatonicScale = [
    130.81, 146.83, 164.81, 196.00, 220.00, // Octave 3
    261.63, 293.66, 329.63, 392.00, 440.00, // Octave 4
    523.25, 587.33, 659.25, 783.99, 880.00, // Octave 5
    1046.50, 1174.66, 1318.51, 1567.98, 1760.00 // Octave 6
  ];

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master volume node
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.12, this.ctx.currentTime); // keep it subtle and low volume

      // Echo effect
      this.echoDelay = this.ctx.createDelay(1.0);
      this.echoDelay.delayTime.setValueAtTime(0.25, this.ctx.currentTime);

      this.echoFeedback = this.ctx.createGain();
      this.echoFeedback.gain.setValueAtTime(0.3, this.ctx.currentTime);

      // Connect Echo feedback loop
      this.echoDelay.connect(this.echoFeedback);
      this.echoFeedback.connect(this.echoDelay);

      // Connect nodes: master -> output
      this.masterVolume.connect(this.ctx.destination);
      
      // Connect master -> echo -> master
      this.masterVolume.connect(this.echoDelay);
      this.echoDelay.connect(this.masterVolume);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (!muted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Trigger a soft button-click sound
  public playClick() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterVolume) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(150, time + 0.08);

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.masterVolume);

    osc.start(time);
    osc.stop(time + 0.09);
  }

  // Trigger a nice synthesized note based on population statistics
  public playEvolveStep(population: number, change: number, density: number) {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterVolume || population === 0) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const time = this.ctx.currentTime;

    // Pick a note from the pentatonic scale based on density (0.0 to 1.0)
    const scaleIndex = Math.min(
      this.pentatonicScale.length - 1,
      Math.floor(density * 2.5 * this.pentatonicScale.length)
    );
    const frequency = this.pentatonicScale[scaleIndex];

    // Create oscillator
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Use triangle wave for a warm, synth-pluck sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, time);

    // Apply low pass filter to make it warmer
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.35);

    // Gain envelope: fast attack, slow decay
    const volume = Math.min(0.2, 0.03 + Math.abs(change) / 200); // sound intensity based on cell change activity
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    // Connect nodes
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterVolume);

    // Play
    osc.start(time);
    osc.stop(time + 0.45);
  }

  // Play a startup ascending chord
  public playPowerUp() {
    this.init();
    const ctx = this.ctx;
    const masterVolume = this.masterVolume;
    if (this.isMuted || !ctx || !masterVolume) return;
    if (ctx.state === 'suspended') ctx.resume();

    const time = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + index * 0.08);

      gain.gain.setValueAtTime(0, time + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, time + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + index * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(masterVolume);

      osc.start(time + index * 0.08);
      osc.stop(time + index * 0.08 + 0.35);
    });
  }

  // Play a shutdown descending chord
  public playPowerDown() {
    this.init();
    const ctx = this.ctx;
    const masterVolume = this.masterVolume;
    if (this.isMuted || !ctx || !masterVolume) return;
    if (ctx.state === 'suspended') ctx.resume();

    const time = ctx.currentTime;
    const notes = [523.25, 392.00, 329.63, 261.63];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + index * 0.06);

      gain.gain.setValueAtTime(0, time + index * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, time + index * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + index * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(masterVolume);

      osc.start(time + index * 0.06);
      osc.stop(time + index * 0.06 + 0.3);
    });
  }
}

export const audioSynth = new SoundSynthesizer();
