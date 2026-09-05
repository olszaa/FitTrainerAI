/**
 * Audio Synthesizer using Web Audio API for timer countdowns and completion alerts
 */
class SoundEngine {
  constructor() {
    this.audioCtx = null;
  }

  initCtx() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play short countdown beep (e.g. 3-2-1)
  playBeep(frequency = 880, duration = 0.15) {
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play pleasant completion chime (tada sound)
  playCompletionChime() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 0.35);
        }, idx * 120);
      });
    } catch (e) {
      console.warn('Completion chime error:', e);
    }
  }
}

export const soundManager = new SoundEngine();
