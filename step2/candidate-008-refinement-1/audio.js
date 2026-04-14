/**
 * Small synthesized sound effects built with the Web Audio API.
 * This avoids extra asset files while still making the machine feel responsive.
 */
export class SlotAudio {
  constructor() {
    this.context = null;
  }

  async ensureContext() {
    if (!this.context) {
      this.context = new window.AudioContext();
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  async playPull() {
    await this.ensureContext();
    this.playTone(180, 0.08, "triangle", 0.05, 0);
    this.playTone(150, 0.12, "sawtooth", 0.04, 0.05);
  }

  async playReelStop(index) {
    await this.ensureContext();
    const frequencies = [420, 520, 640];
    this.playTone(frequencies[index] || 480, 0.09, "square", 0.035, 0);
  }

  async playOutcome(type) {
    await this.ensureContext();

    if (type === "jackpot") {
      this.playTone(660, 0.12, "triangle", 0.05, 0);
      this.playTone(880, 0.16, "triangle", 0.05, 0.12);
      this.playTone(1100, 0.24, "triangle", 0.05, 0.24);
      return;
    }

    if (type === "double") {
      this.playTone(520, 0.12, "sine", 0.04, 0);
      this.playTone(680, 0.14, "sine", 0.04, 0.12);
      return;
    }

    this.playTone(220, 0.18, "sawtooth", 0.035, 0);
  }

  playTone(frequency, duration, type, volume, delay) {
    const startTime = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
}
