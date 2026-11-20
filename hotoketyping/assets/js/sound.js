/* ==========================================
   仏タイピング - サウンドシステム (sound.js) - 完全版
   Web Audio APIによる動的サウンド生成＆ファイル再生
   ========================================== */

class SoundSystem {
  constructor() {
    this.audioCtx = null;
    this.master = null;      // 改良した音用のマスター出力（コンプレッサー経由）
    this.noiseBuffer = null; // タイプ音用ノイズのキャッシュ
  }

  // ユーザーの操作をきっかけにAudioContextを初期化
  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();

        // マスター: 音量を確保しつつ、重なっても音割れしないようにコンプレッサーを通す
        const comp = this.audioCtx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-14, this.audioCtx.currentTime);
        comp.knee.setValueAtTime(12, this.audioCtx.currentTime);
        comp.ratio.setValueAtTime(6, this.audioCtx.currentTime);
        comp.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
        comp.release.setValueAtTime(0.15, this.audioCtx.currentTime);

        this.master = this.audioCtx.createGain();
        this.master.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
        this.master.connect(comp);
        comp.connect(this.audioCtx.destination);

        // タイプ音用の白色ノイズ（1秒分を使い回す）
        const len = this.audioCtx.sampleRate;
        this.noiseBuffer = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate);
        const d = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
          d[i] = Math.random() * 2 - 1;
        }
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(e => {
        console.log('AudioContext resume failed:', e);
      });
    }
  }

  // 1. スタート音：上昇アルペジオ（厚みと余韻を持たせた「いくぞ！」感のある音）
  playStartSound() {
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    const step = 0.07;

    // 開始の合図となる低いドン（サブベース）
    {
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(130.81, now);
      sub.frequency.exponentialRampToValueAtTime(65.41, now + 0.35);
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.45, now + 0.01);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      sub.connect(subGain);
      subGain.connect(this.master);
      sub.start(now);
      sub.stop(now + 0.42);
    }

    notes.forEach((freq, index) => {
      const startTime = now + index * step;
      const isLast = index === notes.length - 1;
      const dur = isLast ? 1.1 : 0.32;

      // 3層重ね: 明るい三角波 + 太い低オクターブ + きらめく高オクターブ
      const layers = [
        { type: 'triangle', mult: 1,   vol: isLast ? 0.34 : 0.28 },
        { type: 'sine',     mult: 0.5, vol: 0.22 },
        { type: 'sine',     mult: 2,   vol: 0.07 }
      ];

      layers.forEach(layer => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = layer.type;
        osc.frequency.setValueAtTime(freq * layer.mult, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(layer.vol, startTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.master);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.02);
      });
    });
  }

  // 2. ゲーム終了時の音：「シュウゥ…ドン！」と締める、ゲーム終了の合図（笛は使わない）
  playFinishSound() {
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // (a) 下降スイープ: 高い音から一気に落ちる「シュウゥ」（パワーダウン風）
    [{ type: 'square', vol: 0.12 }, { type: 'triangle', vol: 0.25 }].forEach(layer => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = layer.type;
      osc.frequency.setValueAtTime(1318.51, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.28);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(layer.vol, now + 0.01);
      gain.gain.setValueAtTime(layer.vol, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.32);
    });

    // (b) 締めの「ドン！」: 空白5度の重い和音（ド・ソ・ド・ソ）。閉じていくフィルターで余韻を消す
    const hit = now + 0.30;
    {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2200, hit);
      lp.frequency.exponentialRampToValueAtTime(250, hit + 0.6);
      lp.Q.setValueAtTime(1, hit);

      const bus = ctx.createGain();
      bus.gain.setValueAtTime(0.001, hit);
      bus.gain.linearRampToValueAtTime(0.28, hit + 0.01);
      bus.gain.exponentialRampToValueAtTime(0.001, hit + 0.75);

      lp.connect(bus);
      bus.connect(this.master);

      [130.81, 196.00, 261.63, 392.00].forEach(freq => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, hit);
        g.gain.setValueAtTime(0.25, hit);
        osc.connect(g);
        g.connect(lp);
        osc.start(hit);
        osc.stop(hit + 0.8);
      });
    }

    // 低い胴鳴り（サブベース）
    {
      const sub = ctx.createOscillator();
      const g = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(110, hit);
      sub.frequency.exponentialRampToValueAtTime(45, hit + 0.25);
      g.gain.setValueAtTime(0.001, hit);
      g.gain.linearRampToValueAtTime(0.55, hit + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, hit + 0.55);
      sub.connect(g);
      g.connect(this.master);
      sub.start(hit);
      sub.stop(hit + 0.57);
    }

    // 打撃のアタック感（短いノイズ）
    {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1200, hit);
      bp.Q.setValueAtTime(0.8, hit);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, hit);
      g.gain.linearRampToValueAtTime(0.25, hit + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, hit + 0.12);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.master);
      src.start(hit, Math.random() * 0.4);
      src.stop(hit + 0.14);
    }
  }

  // 鐘の音（倍音を重ねた、柔らかいアタックの音）
  _playBellTone(time, freq, duration, vol) {
    const ctx = this.audioCtx;
    const partials = [
      { mult: 1,    amp: 1.0 },
      { mult: 2,    amp: 0.35 },
      { mult: 3,    amp: 0.15 },
      { mult: 4.2,  amp: 0.07 }
    ];

    partials.forEach((p, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const partialDur = duration / (1 + i * 0.6);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p.mult, time);

      // 急に鳴ってびっくりしないよう、ごく短いフェードインを付ける
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(vol * p.amp, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + partialDur);

      osc.connect(gain);
      gain.connect(this.master);

      osc.start(time);
      osc.stop(time + partialDur + 0.02);
    });
  }

  // やわらかいパッド音（和音用）
  _playPadTone(time, freq, duration, vol) {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.master);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }



  // 3. タイプ音：デスクトップPCのメカニカルキーボード風「コトッ」というASMR系の音
  playTypeSound() {
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // 毎回少しだけ音程・音量を揺らして、機械的に聞こえないようにする
    const rand = 0.92 + Math.random() * 0.16;
    const volRand = 0.9 + Math.random() * 0.2;

    // (a) 打鍵の「コッ」: 底打ちの低い胴鳴り（本体の響き）
    {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220 * rand, now);
      osc.frequency.exponentialRampToValueAtTime(90 * rand, now + 0.07);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.7 * volRand, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    // (b) キーを押し込む瞬間の「カッ」: バンドパスで中域を強調したノイズ
    {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1800 * rand, now);
      bp.Q.setValueAtTime(1.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.55 * volRand, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      src.connect(bp);
      bp.connect(gain);
      gain.connect(this.master);
      src.start(now, Math.random() * 0.5);
      src.stop(now + 0.04);
    }

    // (c) 底打ち後の「ポトッ」: 短く丸いローパスノイズ
    {
      const t = now + 0.012;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(700 * rand, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.5 * volRand, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      src.connect(lp);
      lp.connect(gain);
      gain.connect(this.master);
      src.start(t, Math.random() * 0.5);
      src.stop(t + 0.07);
    }

    // (d) ほんの少しの高域の「チッ」: キー離れ・スイッチの質感
    {
      const t = now + 0.004;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(4500, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12 * volRand, t + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      src.connect(hp);
      hp.connect(gain);
      gain.connect(this.master);
      src.start(t, Math.random() * 0.5);
      src.stop(t + 0.02);
    }
  }

  // 4. ミス音：程よく高い「ピコ」音
  playMissSound() {
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // 「ピ」→「コ」の2音（高め→やや下）
    const tones = [
      { freq: 1046.50, offset: 0.0,  duration: 0.06 }, // ピ
      { freq: 783.99,  offset: 0.055, duration: 0.10 } // コ
    ];

    tones.forEach(t => {
      const startTime = now + t.offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(t.freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + t.duration);

      osc.connect(gain);
      gain.connect(this.master);

      osc.start(startTime);
      osc.stop(startTime + t.duration + 0.01);
    });
  }

  // 5. ベストタイム更新時の音
  playNewRecordSound() {
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const freqs = [1046.50, 1318.51, 1567.98, 2093.00];

    freqs.forEach((freq, i) => {
      const startTime = now + i * 0.05;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  // 6. ランキングボタン開閉用
  playClipboardSound() {
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 7. データ削除時警告音
  playDeleteWarningSound() {
    const audioPaths = [
      '/assets/audio/delete_warning_sound.mp3',
      '/delete_warning_sound.mp3'
    ];

    const tryPlayAudio = (index) => {
      if (index >= audioPaths.length) return;
      const audio = new Audio(audioPaths[index]);
      audio.play().catch(() => {
        tryPlayAudio(index + 1);
      });
    };

    try {
      tryPlayAudio(0);
    } catch (e) {
      console.error('Audio error:', e);
    }
  }
}

// ★ window.soundSystem として確実にグローバル登録する
window.soundSystem = new SoundSystem();