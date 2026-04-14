/**
 * Lightweight synth effects so the app can have sound without audio assets.
 */
export function createAudioManager() {
  let audioContext;
  let enabled = true;

  function ensureContext() {
    if (!enabled) {
      return null;
    }

    if (!audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) {
        return null;
      }
      audioContext = new Context();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  }

  function tone(frequency, duration, type, volume = 0.05) {
    const context = ensureContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  return {
    setEnabled(nextValue) {
      enabled = nextValue;
    },
    spinTick(index) {
      tone(220 + index * 80, 0.02, "square", 0.04);
    },
    reelStop(index) {
      tone(360 + index * 100, 0.05, "triangle", 0.05);
    },
    win(isJackpot) {
      tone(isJackpot ? 680 : 520, 0.16, isJackpot ? "sawtooth" : "triangle", 0.08);
    },
    loss() {
      tone(180, 0.08, "sine", 0.05);
    },
    action() {
      tone(460, 0.09, "triangle", 0.06);
    }
  };
}
