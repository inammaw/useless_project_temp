// Retro Web Audio Synthesizer for Tharavadu 95

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled() {
    return this.soundEnabled;
  }

  // Retro keyboard key click
  public playKeyClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {
      // AudioContext fallback
    }
  }

  // Windows 95 style startup or success chord - iconic Brian Eno style arpeggio
  public playStartup() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Classic Win95 major pentatonic chime chords: Eb3, Bb3, Eb4, G4, Bb4, C5, Eb5
      const chords = [
        { freq: 155.56, time: 0.0, dur: 2.2, type: 'triangle' as OscillatorType, vol: 0.12 }, // Eb3 deep root
        { freq: 233.08, time: 0.1, dur: 2.0, type: 'sine' as OscillatorType, vol: 0.14 }, // Bb3
        { freq: 311.13, time: 0.25, dur: 1.8, type: 'triangle' as OscillatorType, vol: 0.12 }, // Eb4
        { freq: 392.00, time: 0.45, dur: 1.6, type: 'sine' as OscillatorType, vol: 0.13 }, // G4
        { freq: 466.16, time: 0.65, dur: 1.5, type: 'triangle' as OscillatorType, vol: 0.11 }, // Bb4
        { freq: 523.25, time: 0.85, dur: 1.4, type: 'sine' as OscillatorType, vol: 0.10 }, // C5
        { freq: 622.25, time: 1.05, dur: 1.8, type: 'triangle' as OscillatorType, vol: 0.12 }, // Eb5 chime peak
      ];

      chords.forEach(({ freq, time, dur, type, vol }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + time);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + time + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + time);
        osc.stop(this.ctx.currentTime + time + dur + 0.1);
      });
    } catch {
      // AudioContext fallback
    }
  }

  // Classic Windows 95 error chord / Amma scold sound
  public playErrorChord() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'square';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3
      osc2.frequency.setValueAtTime(155.56, this.ctx.currentTime); // D#3 dissonant clash

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.4);
      osc2.stop(this.ctx.currentTime + 0.4);
    } catch {
      // ignore
    }
  }

  // KSEB Inverter warning beep
  public playInverterBeep() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(980, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // ignore
    }
  }

  // Thunder rumble for MAZHA.EXE
  public playThunder() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 1.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 1.5);
    } catch {
      // ignore
    }
  }

  // Pressure cooker whistle
  public playPressureCooker() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2800, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.09, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.42);
    } catch {
      // ignore
    }
  }

  // Harsh retro BSOD crash buzz
  public playBsodCrash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // Low A
      osc2.frequency.setValueAtTime(116, this.ctx.currentTime); // Dissonant beating
      osc1.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.9);
      osc2.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.9);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.1);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.2);
      osc2.stop(this.ctx.currentTime + 1.2);
    } catch {
      // ignore
    }
  }

  // Preethi / Butterfly / Panasonic 750W Indian Kitchen Mixer Grinder
  // Authentic acoustic synthesis:
  // 1. Initial rotary speed switch click ('khat')
  // 2. Heavy 50Hz AC mains hum + universal series-wound motor low-frequency growl (100Hz - 220Hz)
  // 3. High-RPM 18,000 RPM screaming whine (900Hz - 1600Hz) modulated with blade rotation
  // 4. Chunky coconut/dal grinding friction noise with amplitude modulation (chopping chunks)
  // 5. Distinct two-pulse Indian mixie burst pattern ("whiiir-whirrr-WHIIIIRRRRRRR-vrooom")
  public playMixieGrind(isAmbient: boolean = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = isAmbient ? 2.8 : 2.2;
      const vol = isAmbient ? 0.12 : 0.22;

      // 1. Rotary Knob Switch Snap ("KHAK")
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(800, now);
      clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
      clickGain.gain.setValueAtTime(vol * 0.4, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.045);

      const motorStart = now + 0.05;

      // 2. Heavy 50Hz AC Universal Motor Growl (the deep vibration through the kitchen granite slab)
      const humOsc = this.ctx.createOscillator();
      const humGain = this.ctx.createGain();
      humOsc.type = 'sawtooth';
      humOsc.frequency.setValueAtTime(100, motorStart); // 2x 50Hz mains frequency
      humOsc.frequency.linearRampToValueAtTime(150, motorStart + 0.3);
      humGain.gain.setValueAtTime(0.001, motorStart);
      humGain.gain.linearRampToValueAtTime(vol * 0.7, motorStart + 0.2);
      humGain.gain.setValueAtTime(vol * 0.6, motorStart + duration - 0.5);
      humGain.gain.exponentialRampToValueAtTime(0.001, motorStart + duration);

      // 3. High-RPM Commutator Scream & Whine (14,000 - 18,000 RPM armature scream)
      const whineOsc = this.ctx.createOscillator();
      const whineGain = this.ctx.createGain();
      whineOsc.type = 'sawtooth';
      // Pitch ramp: revving up on Speed 1 -> Speed 2
      whineOsc.frequency.setValueAtTime(280, motorStart);
      whineOsc.frequency.exponentialRampToValueAtTime(680, motorStart + 0.25);
      whineOsc.frequency.setValueAtTime(620, motorStart + 0.4); // momentary dip when blade hits coconut
      whineOsc.frequency.exponentialRampToValueAtTime(950, motorStart + 0.7); // speed 2 scream
      whineOsc.frequency.setValueAtTime(980, motorStart + duration - 0.4);
      whineOsc.frequency.exponentialRampToValueAtTime(180, motorStart + duration); // deceleration

      // High-frequency harmonic overtone
      const harmonicOsc = this.ctx.createOscillator();
      const harmonicGain = this.ctx.createGain();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(560, motorStart);
      harmonicOsc.frequency.exponentialRampToValueAtTime(1900, motorStart + 0.7);
      harmonicOsc.frequency.exponentialRampToValueAtTime(360, motorStart + duration);

      // Low-pass filter to give realistic body and prevent harsh digital buzzer sound
      const motorFilter = this.ctx.createBiquadFilter();
      motorFilter.type = 'lowpass';
      motorFilter.frequency.setValueAtTime(2200, motorStart);
      motorFilter.Q.setValueAtTime(1.5, motorStart);

      // 4. Amplitude Modulation (The rapid "chug-chug-chug" blade rotation at 50-70 rps)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(45, motorStart); // 45 Hz rotation flutter
      lfoGain.gain.setValueAtTime(vol * 0.25, motorStart);

      whineGain.gain.setValueAtTime(0.001, motorStart);
      whineGain.gain.linearRampToValueAtTime(vol * 0.9, motorStart + 0.3);
      whineGain.gain.setValueAtTime(vol * 0.85, motorStart + duration - 0.4);
      whineGain.gain.exponentialRampToValueAtTime(0.001, motorStart + duration);

      harmonicGain.gain.setValueAtTime(0.001, motorStart);
      harmonicGain.gain.linearRampToValueAtTime(vol * 0.35, motorStart + 0.3);
      harmonicGain.gain.setValueAtTime(vol * 0.3, motorStart + duration - 0.4);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, motorStart + duration);

      // 5. Coconut / Chutney Jar Grinding Texture (Filtered White Noise with resonant bandpass)
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Harsh gritty metallic jar turbulence
        output[i] = (Math.random() * 2 - 1) * 0.6;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Stainless steel jar acoustic resonance (1.4kHz - 2.8kHz)
      const jarFilter = this.ctx.createBiquadFilter();
      jarFilter.type = 'bandpass';
      jarFilter.frequency.setValueAtTime(1600, motorStart);
      jarFilter.Q.setValueAtTime(3.2, motorStart);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, motorStart);
      noiseGain.gain.linearRampToValueAtTime(vol * 0.75, motorStart + 0.3);
      noiseGain.gain.setValueAtTime(vol * 0.7, motorStart + duration - 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, motorStart + duration - 0.05);

      // Connect noise
      noiseSource.connect(jarFilter);
      jarFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      // Connect motor oscillators
      humOsc.connect(humGain);
      humGain.connect(this.ctx.destination);

      whineOsc.connect(whineGain);
      harmonicOsc.connect(harmonicGain);

      whineGain.connect(motorFilter);
      harmonicGain.connect(motorFilter);
      motorFilter.connect(this.ctx.destination);

      // Start all sound generators
      humOsc.start(motorStart);
      whineOsc.start(motorStart);
      harmonicOsc.start(motorStart);
      noiseSource.start(motorStart);
      lfo.start(motorStart);

      // Stop all generators
      const stopTime = motorStart + duration + 0.05;
      humOsc.stop(stopTime);
      whineOsc.stop(stopTime);
      harmonicOsc.stop(stopTime);
      noiseSource.stop(stopTime);
      lfo.stop(stopTime);
    } catch {
      // ignore
    }
  }

  // Iron gate creaking sound
  public playGateCreak() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(580, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.42);
    } catch {
      // ignore
    }
  }

  // Amma's signature disapproving tongue click ("Tsk!")
  public playTongueClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  }

  // Retro MSN/ICQ incoming chat message ping
  public playWhatsAppPing() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [659.25, 880.00]; // E5, A5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
      });
    } catch {
      // ignore
    }
  }

  // Cheerful reward chime for successful saree rescue or tea serving
  public playSuccessChime() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.09, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  // Authentic Bajaj Chetak 150cc kickstart rumble sound
  public playScooterKickstart() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Kick sputter
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.28);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();

      // 2-stroke engine low thrumming
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime + 0.05);
      osc.frequency.linearRampToValueAtTime(82, this.ctx.currentTime + 0.18);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.35);

      oscGain.gain.setValueAtTime(0.12, this.ctx.currentTime + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + 0.05);
      osc.stop(this.ctx.currentTime + 0.38);
    } catch {
      // ignore
    }
  }

  // Sonar radar sweep ping
  public playRadarPing() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch {
      // ignore
    }
  }
}

export const sounds = new SoundManager();
