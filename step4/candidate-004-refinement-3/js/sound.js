/**
 * Lightweight procedural sound so the project does not need external assets.
 */
export function createSoundPlayer(prefersReducedMotion) {
  let audioContext;

  function getContext() {
    if (prefersReducedMotion) {
      return null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    return audioContext;
  }

  function playTone({ frequency, duration, type = "sine", volume = 0.03, delay = 0 }) {
    const context = getContext();
    if (!context) {
      return;
    }

    const startAt = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  return {
    playSpinStart() {
      playTone({ frequency: 220, duration: 0.12, type: "triangle", volume: 0.025 });
    },
    playReelStop(offset) {
      playTone({ frequency: 320 + offset * 80, duration: 0.08, type: "square", volume: 0.015 });
    },
    playWin() {
      playTone({ frequency: 523.25, duration: 0.12, type: "triangle", delay: 0 });
      playTone({ frequency: 659.25, duration: 0.12, type: "triangle", delay: 0.08 });
      playTone({ frequency: 783.99, duration: 0.18, type: "triangle", delay: 0.16 });
    },
    playReset() {
      playTone({ frequency: 260, duration: 0.08, type: "sine" });
      playTone({ frequency: 200, duration: 0.12, type: "sine", delay: 0.08 });
    },
  };
}
