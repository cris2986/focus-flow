// Sound utility using Web Audio API

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

// Play a pleasant completion sound (two-tone chime)
export const playCompletionSound = (): void => {
  try {
    const ctx = getAudioContext();

    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 523.25; // C5
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Second tone (higher, delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 659.25; // E5
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.5);

    // Third tone (highest, creates pleasant chord)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.value = 783.99; // G5
    osc3.type = 'sine';
    gain3.gain.setValueAtTime(0, ctx.currentTime);
    gain3.gain.setValueAtTime(0.25, ctx.currentTime + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
    osc3.start(ctx.currentTime + 0.3);
    osc3.stop(ctx.currentTime + 0.7);
  } catch (error) {
    console.warn('Could not play sound:', error);
  }
};
