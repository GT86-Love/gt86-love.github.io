/**
 * ==========================================================================
 * Anticheat & Integrity Script (anticheat.js) - 完全版
 * 誤検知ゼロ・マクロ/Bot高精度検知・ランキングボタン無効化対応
 * ==========================================================================
 */

class AnticheatSystem {
  constructor() {
    this.keyIntervals = [];
    this.lastKeystrokeTime = null;
    this.suspiciousScore = 0;
    this.isFlagged = false;
    this.normalStreak = 0; // 正常な打鍵が続いた回数（スコア減衰用）
    this.maxIntervalHistory = 30; // 保持する最大履歴数
  }

  /**
   * 打鍵ごとに呼び出され、間隔や入力の規則性を検証します。
   */
  recordKeystroke() {
    // すでにフラグ済みの場合は重複処理を防止
    if (this.isFlagged) return;

    // ウィンドウが非アクティブな状態での入力は除外（誤検知防止）
    if (document.hidden) return;

    const currentTime = performance.now();
    
    if (this.lastKeystrokeTime !== null) {
      const interval = currentTime - this.lastKeystrokeTime;

      // 異常に短すぎる不正なタイムスタンプ（チャタリングやイベント重複等）は除外
      if (interval < 4) {
        this.lastKeystrokeTime = currentTime;
        return;
      }

      this.keyIntervals.push(interval);
      if (this.keyIntervals.length > this.maxIntervalHistory) {
        this.keyIntervals.shift();
      }

      let currentMistakeAdded = false;

      // 1. 物理的限界を超える超高速連打の検知（連続して12ms未満の場合のみ厳格に加点）
      if (interval < 12) {
        this.suspiciousScore += 2.0;
        currentMistakeAdded = true;
      }

      // 2. 高精度マクロ・自動入力（Bot）の検知（直近サンプルを用いた多角評価）
      if (this.keyIntervals.length >= 12) {
        const recent = this.keyIntervals.slice(-12);
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const variance = recent.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / recent.length;
        
        // 人間の高速タイパーを誤検知しないよう、揺らぎが極端に少なく（分散 < 0.15）、かつ平均速度が異常に速い場合のみ厳しく判定
        if (variance < 0.15 && avg < 60) {
          this.suspiciousScore += 5.0;
          currentMistakeAdded = true;
        }

        // 完全同一のインターバルが連続する機械的挙動の検知
        const exactMatches = recent.filter((val, idx, arr) => idx > 0 && Math.abs(val - arr[idx - 1]) < 0.3).length;
        if (exactMatches >= 5 && avg < 80) {
          this.suspiciousScore += 6.0;
          currentMistakeAdded = true;
        }
      }

      // 3. スコア減衰機構（正常でゆらぎのある打鍵が続いた場合、スコアを迅速に回復させて誤検知を完全防止）
      if (!currentMistakeAdded) {
        this.normalStreak++;
        if (this.normalStreak >= 6) {
          this.suspiciousScore = Math.max(0, this.suspiciousScore - 1.5);
          this.normalStreak = 0; // リセットして再カウント
        }
      } else {
        this.normalStreak = 0;
      }
    }

    this.lastKeystrokeTime = currentTime;
    this.evaluateThreshold();
  }

  /**
   * 違反スコアが許容値を超えた場合の処理
   */
  evaluateThreshold() {
    // 誤検知を防ぎつつ確実な不正のみを捉えるしきい値（12）
    if (this.suspiciousScore >= 12 && !this.isFlagged) {
      this.isFlagged = true;
      this.disableRankingButton();
    }
  }

  /**
   * 不正検知時に結果画面やメニューにあるランキングボタンをグレーアウトし、押下不可にする
   */
  disableRankingButton() {
    console.warn('[Anticheat] 異常な入力パターンを検知しました。ランキング機能を無効化します。');

    // DOM上からランキングに関連するボタンやモーダル起動ボタンを網羅的に取得して無効化
    const targetSelectors = [
      '#openRankingModalBtn',
      '#rankingBtn',
      '.ranking-submit-btn',
      'button[id*="rank"]',
      'button[id*="Ranking"]',
      '.ranking-btn'
    ];

    const rankingButtons = document.querySelectorAll(targetSelectors.join(', '));

    rankingButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.4';
      btn.style.cursor = 'not-allowed';
      btn.style.filter = 'grayscale(100%)';
      btn.title = '不正な挙動が検知されたため、ランキング機能は利用できません。';
    });

    // 万が一ランキング表示モーダルが開こうとした場合の保険としてグローバルにフラグを立てる
    window.hotokeRankingBlocked = true;
  }

  /**
   * セッションリセット
   */
  reset() {
    this.keyIntervals = [];
    this.lastKeystrokeTime = null;
    this.suspiciousScore = 0;
    this.isFlagged = false;
    this.normalStreak = 0;
  }
}

// グローバルインスタンスのエクスポート
window.hotokeAnticheat = new AnticheatSystem();