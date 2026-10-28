/**
 * Procedural Web Audio Sound Synthesizer for Kids Center Pro Games
 * Delivers immediate, rich auditory feedback without external audio file dependencies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Check saved audio preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kcp_audio_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kcp_audio_muted', String(this.muted));
    }
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kcp_audio_muted', String(this.muted));
    }
  }

  // Soft tactile button tap
  public playClick(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Happy chime for correct answer (Duolingo-style ascending bright chime)
  public playCorrect(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  // Gentle, friendly low tone for incorrect answers
  public playIncorrect(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.28);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Coin collect ping
  public playCoin(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [987.77, 1318.51]; // B5, E6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  // Grand fanfare on lesson / unit completion
  public playFanfare(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.4 },  // C6 (hold)
      { f: 880.00, d: 0.12 }, // A5
      { f: 1046.5, d: 0.6 }   // C6 (grand finish)
    ];

    let t = ctx.currentTime;
    notes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + item.d + 0.05);

      t += item.d * 0.85;
    });
  }

  // Shimmering treasure chest reward sound
  public playChest(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const chords = [587.33, 739.99, 880.00, 1174.66, 1479.98];
    const now = ctx.currentTime;

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  }

  // Streak flame ignite sound
  public playStreak(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Heart lost / game over tone
  public playStreakLost(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [320, 280, 240, 190];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  public playHeartLost(): void {
    this.playStreakLost();
  }
}

export const sounds = new SoundManager();
