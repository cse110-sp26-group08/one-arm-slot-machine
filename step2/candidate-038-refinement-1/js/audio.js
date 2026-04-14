/**
 * Lightweight Web Audio helpers so the app has feedback without external sound files.
 */
export class SoundBoard {
  constructor() {
    this.audioContext = null;
  }

  ensureContext() {
    if (!this.audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      this.audioContext = Context ? new Context() : null;
    }

    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  playTone({ frequency, duration, type = "sine", gain = 0.04 }) {
    const context = this.ensureContext();

    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const now = context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  playSpinTick(step) {
    this.playTone({
      frequency: 260 + step * 18,
      duration: 0.08,
      type: "square",
      gain: 0.028
    });
  }

  playWin() {
    [440, 554, 659].forEach((frequency, index) => {
      window.setTimeout(() => {
        this.playTone({ frequency, duration: 0.24, type: "triangle", gain: 0.045 });
      }, index * 90);
    });
  }

  playLoss() {
    [240, 180].forEach((frequency, index) => {
      window.setTimeout(() => {
        this.playTone({ frequency, duration: 0.22, type: "sawtooth", gain: 0.04 });
      }, index * 120);
    });
  }

  playReset() {
    this.playTone({ frequency: 392, duration: 0.12, type: "triangle", gain: 0.035 });
  }
}
