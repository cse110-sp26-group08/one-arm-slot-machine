/**
 * Tiny Web Audio helper so the project can ship sound effects without extra assets.
 */
export class SoundBoard {
  constructor() {
    this.audioContext = null;
  }

  getContext() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = AudioContextClass ? new AudioContextClass() : null;
    }

    return this.audioContext;
  }

  async resume() {
    const context = this.getContext();

    if (context && context.state === "suspended") {
      await context.resume();
    }
  }

  playTone({ frequency, duration, type = "sine", gain = 0.04, delay = 0 }) {
    const context = this.getContext();

    if (!context) {
      return;
    }

    const startTime = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.exponentialRampToValueAtTime(gain, startTime + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(envelope);
    envelope.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  playSpinTick(index) {
    this.playTone({
      frequency: 220 + index * 80,
      duration: 0.08,
      type: "square",
      gain: 0.025
    });
  }

  playReelStop(index) {
    this.playTone({
      frequency: 380 + index * 110,
      duration: 0.14,
      type: "triangle",
      gain: 0.03
    });
  }

  playWin(level) {
    const notes = level === "big" ? [523.25, 659.25, 783.99] : [392, 493.88];

    notes.forEach((frequency, index) => {
      this.playTone({
        frequency,
        duration: 0.22,
        type: "sine",
        gain: 0.05,
        delay: index * 0.08
      });
    });
  }

  playLoss() {
    [240, 180].forEach((frequency, index) => {
      this.playTone({
        frequency,
        duration: 0.18,
        type: "sawtooth",
        gain: 0.03,
        delay: index * 0.1
      });
    });
  }
}
