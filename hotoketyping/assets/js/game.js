/* ==========================================
   仏タイピング - ゲームコアシステム (game.js) - 完全版
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ゲームの状態変数
  let gameState = 'HOME'; // HOME, WAITING_FIRST_KEY, PLAYING, RESULT
  let currentWord = { text: "仏タイピング", romaji: "hotoketaiping" };
  let typedLength = 0;
  let startTime = null;
  let timerInterval = null; // タイマーID保持用
  let elapsedTime = 0;
  let missCount = 0;
  let totalTypedCount = 0;
  let comboCount = 0;
  let maxCombo = 0;
  let isComboActive = false;
  let keyIntervals = [];
  let lastKeyTime = null;
  let isTimeoutEnd = false; // タイムアップフラグ

  // タイピング入力を有効にするかどうかのフラグ
  let isTypingEnabled = false;

  // 残り時間および1分間で獲得した笑顔スコアの管理用変数
  let timeLeft = 60.0; // 制限時間（秒）
  let smileCount = 0;  // 1分間で獲得した笑顔スコア（インフレ加算値）

  // 笑顔になるたびの加算ステップ管理用変数（0回目は1、以降は100, 200, 300...）
  let currentSmileStep = 0;

  // 画面遷移アニメーションタイマー保持用
  let transitionTimeout = null;

  // ゲームクリアに必要な単語数（メーター満タンの閾値基準）
  const totalWordsToClear = 10;
  let clearedWordsCount = 0; // ★ ここで確実に変数を宣言

  // 選択中の顔・アンロック状態管理（★ localStorageから前回の選択を復元するよう修正）
  let selectedFace = localStorage.getItem('hotoke_selected_face') || 'normal'; // normal, boss, mother, artisan, teacher, hermit, buddha
  
  // --- タイピング設定の状態管理（★ localStorageから復元） ---
  let isRomajiVisible = localStorage.getItem('hotoke_romaji_guide') !== 'false';
  let isSoundEnabled = localStorage.getItem('hotoke_sound_enabled') !== 'false';

  const faceNames = {
    normal: '普通の人',
    boss: '上司',
    mother: 'お母さん',
    artisan: '職人',
    teacher: '厳しい先生',
    hermit: '仙人',
    buddha: '仏'
  };

  // ファイル名マッピング用
  const faceFileMap = {
    normal: 'default',
    boss: 'boss',
    mother: 'mother',
    artisan: 'craftsman',
    teacher: 'teacher',
    hermit: 'hermit',
    buddha: 'hotoke'
  };

  // 各顔のアンロック条件（プレイ回数 / 笑顔にした数）
  const faceUnlockConditions = {
    normal: 0,
    boss: 10,
    mother: 25,
    artisan: 45,
    teacher: 80,
    hermit: 120,
    buddha: 150
  };

  // モーダル等での表示順（一番上が仏、一番下が普通の人）
  const faceOrder = ['buddha', 'hermit', 'teacher', 'artisan', 'mother', 'boss', 'normal'];

  // サウンド再生用のヘルパー（sound.jsのWeb Audio API機能と連携）
  function playSoundEffect(type) {
    // ★ サウンド設定がOFFの場合は再生しない
    if (!isSoundEnabled) return;

    try {
      if (typeof window.soundSystem !== 'undefined') {
        if (type === 'start' && typeof window.soundSystem.playStartSound === 'function') {
          window.soundSystem.playStartSound();
          return;
        }
        if (type === 'finish' && typeof window.soundSystem.playFinishSound === 'function') {
          window.soundSystem.playFinishSound();
          return;
        }
        if (type === 'type' && typeof window.soundSystem.playTypeSound === 'function') {
          window.soundSystem.playTypeSound();
          return;
        }
        if (type === 'miss' && typeof window.soundSystem.playMissSound === 'function') {
          window.soundSystem.playMissSound();
          return;
        }
        if (type === 'delete' && typeof window.soundSystem.playDeleteWarningSound === 'function') {
          window.soundSystem.playDeleteWarningSound();
          return;
        }
      }
      if (type === 'start' && typeof window.playStartSound === 'function') {
        window.playStartSound();
        return;
      }
      if (type === 'finish' && typeof window.playFinishSound === 'function') {
        window.playFinishSound();
        return;
      }
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  }

  // DOM要素の取得
  const screenHome = document.getElementById('screenHome');
  const screenGame = document.getElementById('screenGame');
  const typingWordEl = document.getElementById('typingWord');
  const smileMeterFill = document.getElementById('smileMeterFill');
  const timerDisplay = document.getElementById('timerDisplay');
  const faceImageEl = document.getElementById('faceImage');

  // --- タイピング設定モーダルのチェックボックス初期化とイベント設定 ---
  const romajiSettingCheckbox = document.getElementById('romajiGuideSetting');
  const soundSettingCheckbox = document.getElementById('soundEffectSetting');

  if (romajiSettingCheckbox) {
    romajiSettingCheckbox.checked = isRomajiVisible;
    romajiSettingCheckbox.addEventListener('change', (e) => {
      isRomajiVisible = e.target.checked;
      localStorage.setItem('hotoke_romaji_guide', isRomajiVisible);
      updateWordDisplay();
    });
  }

  if (soundSettingCheckbox) {
    soundSettingCheckbox.checked = isSoundEnabled;
    soundSettingCheckbox.addEventListener('change', (e) => {
      isSoundEnabled = e.target.checked;
      localStorage.setItem('hotoke_sound_enabled', isSoundEnabled);
    });
  }

  // 初期状態でプレイ画面が非表示になっていることを確実に保証
  if (screenGame) screenGame.style.display = 'none';

  // 2枚重ね（通常＋笑顔）によるスムーズモーフィング用の要素を動的構築または取得
  setupFaceLayers();

  function setupFaceLayers() {
    const faceContainer = document.querySelector('.face-container') || (faceImageEl ? faceImageEl.parentElement : null);
    if (!faceContainer) return;

    faceContainer.style.position = 'relative';
    faceContainer.style.overflow = 'hidden';

    if (faceImageEl) faceImageEl.style.display = 'none';

    if (!document.getElementById('faceNormalLayer')) {
      const normalImg = document.createElement('img');
      normalImg.id = 'faceNormalLayer';
      normalImg.className = 'face-layer-img';
      normalImg.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; pointer-events: none;';
      faceContainer.appendChild(normalImg);
    }

    if (!document.getElementById('faceSmileLayer')) {
      const smileImg = document.createElement('img');
      smileImg.id = 'faceSmileLayer';
      smileImg.className = 'face-layer-img';
      smileImg.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 2; opacity: 0; transition: opacity 0.05s ease-out; pointer-events: none;';
      faceContainer.appendChild(smileImg);
    }

    updateFaceImagesSrc();
  }

  function updateFaceImagesSrc() {
    const prefix = faceFileMap[selectedFace] || 'default';
    const normalLayer = document.getElementById('faceNormalLayer');
    const smileLayer = document.getElementById('faceSmileLayer');

    if (normalLayer) normalLayer.src = `../assets/img/faces/${prefix}_normal.png`;
    if (smileLayer) smileLayer.src = `../assets/img/faces/${prefix}_smile.png`;
  }

  window.setSelectedFace = function(faceKey) {
    if (faceNames[faceKey]) {
      selectedFace = faceKey;
      localStorage.setItem('hotoke_selected_face', faceKey); // ★ 選択した顔をlocalStorageに保存
      updateFaceImagesSrc();
      updateFaceMorph(0);
    }
  };

  // --- 元の不透明度（opacity）制御によるスムーズ変化に戻しました ---
  function updateFaceMorph(progress) {
    const smileLayer = document.getElementById('faceSmileLayer');
    if (smileLayer) {
      // 打ち始めからスムーズに変化するように調整
      const adjustedProgress = progress < 0.02 ? 0 : (progress - 0.02) / 0.98;
      smileLayer.style.opacity = Math.max(0, Math.min(1, adjustedProgress));
    }
  }

  // --- 顔変更モーダルの選択肢カードを動的生成（アンロック条件・並び順反映） ---
  function initFaceModal() {
    const container = document.getElementById('faceListContainer');
    if (!container) return;
    container.innerHTML = '';

    const history = JSON.parse(localStorage.getItem('hotoke_play_history') || '[]');
    const playCount = history.length; // プレイ回数（クリア回数）

    faceOrder.forEach(key => {
      const requiredCount = faceUnlockConditions[key];
      const isUnlocked = playCount >= requiredCount;
      const prefix = faceFileMap[key] || 'default';
      const name = faceNames[key];

      const item = document.createElement('div');
      item.className = 'high-score-box face-card-item' + (isUnlocked ? '' : ' locked');
      if (selectedFace === key && isUnlocked) {
        item.classList.add('selected');
      }

      item.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: ${isUnlocked ? 'flex-start' : 'center'};
        gap: 15px;
        padding: 12px 15px;
        margin: 8px 0;
        cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
        background-color: ${selectedFace === key && isUnlocked ? '#eff6ff' : '#f8fafc'};
        border: 2px solid ${selectedFace === key && isUnlocked ? '#3b82f6' : '#d1d5db'};
        border-radius: 10px;
        position: relative;
        box-sizing: border-box;
        transition: all 0.2s;
        ${isUnlocked ? '' : 'opacity: 0.6; filter: grayscale(1);'}
      `;

      if (isUnlocked) {
        item.innerHTML = `
          <img src="../assets/img/faces/${prefix}_normal.png" class="face-card-icon" style="width: 36px; height: 36px; object-fit: contain; flex-shrink: 0;">
          <span class="face-card-name" style="font-weight: bold; font-size: 0.95rem; color: #1f2937;">${name}</span>
        `;
        item.addEventListener('click', () => {
          window.setSelectedFace(key);
          initFaceModal();
        });
      } else {
        item.innerHTML = `
          <span class="face-card-locked-text" style="font-size: 0.85rem; color: #6b7280; font-weight: bold; text-align: center; width: 100%;">解除するにはプレイ回数が${requiredCount}回以上必要</span>
        `;
      }
      container.appendChild(item);
    });
  }

  // --- プレイ記録データの反映 ---
  function updatePlayRecordData() {
    const history = JSON.parse(localStorage.getItem('hotoke_play_history') || '[]');
    const totalTypedEl = document.getElementById('recordTotalTyped');
    const highScoreEl = document.getElementById('recordHighScore');
    const clearCountEl = document.getElementById('recordClearCount');

    let totalChars = history.reduce((sum, h) => sum + (h.intervals ? h.intervals.length : 0), 0);
    let bestSmile = history.length > 0 ? Math.max(...history.map(h => h.smileCount || 0)) : 0;

    if (totalTypedEl) totalTypedEl.textContent = totalChars;
    if (highScoreEl) highScoreEl.textContent = bestSmile + '回';
    if (clearCountEl) clearCountEl.textContent = history.length;
  }

  // --- アラート代替の専用メッセージモーダルを表示するヘルパー ---
  function showCustomMessageModal(message, onOk = null) {
    const existing = document.getElementById('customMessageModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'customMessageModal';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center;
      font-family: 'Segoe UI', sans-serif;
    `;
    overlay.innerHTML = `
      <div style="background: #ffffff; padding: 25px; border-radius: 12px; width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); text-align: center; position: relative;">
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #1e293b; font-weight: bold; line-height: 1.5;">${message}</p>
        <button id="customModalOkBtn" style="background: #2563eb; color: #fff; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">OK</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('customModalOkBtn').addEventListener('click', () => {
      overlay.remove();
      if (typeof onOk === 'function') onOk();
    });
  }

  // --- バックアップ状態のUI更新と「削除」「復元」ボタンの連動配置 ---
  function updateBackupStatusUI() {
    const statusBox = document.getElementById('backupStatusBox');
    const backupData = localStorage.getItem('hotoke_backup');
    const createBackupBtn = document.getElementById('createBackupBtn');
    
    if (statusBox) {
      let parentContainer = statusBox.parentElement;
      if (parentContainer && !document.getElementById('backupActionsContainer')) {
        const actionContainer = document.createElement('div');
        actionContainer.id = 'backupActionsContainer';
        actionContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 10px;';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.id = 'deleteBackupBtn';
        deleteBtn.className = 'btn-secondary';
        deleteBtn.style.cssText = 'flex: 1; padding: 8px; font-size: 0.9rem; cursor: pointer;';
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', () => {
          localStorage.removeItem('hotoke_backup');
          updateBackupStatusUI();
          showCustomMessageModal('バックアップを削除しました');
        });

        const restoreBtn = document.createElement('button');
        restoreBtn.id = 'restoreBackupBtn';
        restoreBtn.className = 'btn-primary';
        restoreBtn.style.cssText = 'flex: 1; padding: 8px; font-size: 0.9rem; cursor: pointer;';
        restoreBtn.textContent = '復元';
        restoreBtn.addEventListener('click', () => {
          const bData = localStorage.getItem('hotoke_backup');
          if (bData) {
            try {
              const parsed = JSON.parse(bData);
              if (parsed.history) localStorage.setItem('hotoke_play_history', parsed.history);
              if (parsed.rankings) localStorage.setItem('hotoke_rankings', parsed.rankings);
              if (parsed.unlockedRanks) localStorage.setItem('hotoke_unlocked_ranks', parsed.unlockedRanks);
              
              updatePlayRecordData();
              updateRankModalUI();
              updateBackupStatusUI();

              showCustomMessageModal('バックアップを使用してデータを復元しました', () => {
                window.location.reload();
              });
            } catch (e) {
              console.error('Backup restore error:', e);
            }
          }
        });

        actionContainer.appendChild(deleteBtn);
        actionContainer.appendChild(restoreBtn);
        parentContainer.appendChild(actionContainer);
      }

      const delBtn = document.getElementById('deleteBackupBtn');
      const resBtn = document.getElementById('restoreBackupBtn');
      if (delBtn && resBtn) {
        if (backupData) {
          delBtn.style.opacity = '1';
          delBtn.style.cursor = 'pointer';
          resBtn.style.opacity = '1';
          resBtn.style.cursor = 'pointer';
          delBtn.disabled = false;
          resBtn.disabled = false;
        } else {
          delBtn.style.opacity = '0.5';
          delBtn.style.cursor = 'not-allowed';
          resBtn.style.opacity = '0.5';
          resBtn.style.cursor = 'not-allowed';
          delBtn.disabled = true;
          resBtn.disabled = true;
        }
      }

      if (createBackupBtn) {
        if (backupData) {
          createBackupBtn.style.opacity = '0.5';
          createBackupBtn.style.cursor = 'not-allowed';
          createBackupBtn.disabled = true;
        } else {
          createBackupBtn.style.opacity = '1';
          createBackupBtn.style.cursor = 'pointer';
          createBackupBtn.disabled = false;
        }
      }

      if (backupData) {
        const parsed = JSON.parse(backupData);
        statusBox.style.backgroundColor = '#f0fdf4';
        statusBox.style.borderColor = '#bbf7d0';
        statusBox.style.color = '#166534';
        statusBox.textContent = `バックアップ有効 (${parsed.createdAt || '保存済み'})`;
      } else {
        statusBox.style.backgroundColor = '#f8fafc';
        statusBox.style.borderColor = '#d1d5db';
        statusBox.style.color = '#6b7280';
        statusBox.textContent = 'バックアップはありません。';
      }
    }
  }

  // ゲーム開始・入力のトリガー（キーボードイベント）
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
    }

    if (typeof window.checkAndEnforceCookieConsent === 'function') {
      window.checkAndEnforceCookieConsent();
    }

    if (e.code === 'Space' && gameState === 'HOME') {
      const activeModal = document.querySelector('.modal-overlay-active, .cookie-banner[style*="flex"]');
      const cookieBanner = document.getElementById('cookieConsentBanner');
      const isCookieVisible = cookieBanner && cookieBanner.style.display === 'flex';

      if (!activeModal && !isCookieVisible) {
        setupGameScreen(); // スペースキーでは画面切り替え・準備のみ行い、タイマーはスタートしない
      }
    } else if (e.code === 'Escape' && (gameState === 'PLAYING' || gameState === 'WAITING_FIRST_KEY')) {
      e.preventDefault();
      returnToHome();
    } else if (gameState === 'PLAYING' || gameState === 'WAITING_FIRST_KEY') {
      // フェード完了後の0.5秒間が経過するまでは入力を無効化
      if (!isTypingEnabled) return;

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        handleTypingInput(e.key);
      }
    }
  });

  // スペースキー押下時にプレイ画面を準備する関数（タイマーはまだ走らせない）
  function setupGameScreen() {
    if (gameState === 'PLAYING' || gameState === 'WAITING_FIRST_KEY') return;

    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }
    
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (typeof WordSystem !== 'undefined' && typeof WordSystem.resetGame === 'function') {
      WordSystem.resetGame();
    }

    gameState = 'WAITING_FIRST_KEY';
    typedLength = 0;
    missCount = 0;
    totalTypedCount = 0;
    comboCount = 0;
    maxCombo = 0;
    keyIntervals = [];
    lastKeyTime = null;
    elapsedTime = 0;
    isTimeoutEnd = false;
    clearedWordsCount = 0;

    timeLeft = 60.0;
    smileCount = 0;
    currentSmileStep = 0;
    updateSmileCountDisplay(); // ★ プレイ画面の笑顔カウント表示を0に初期化
    
    // 最初からお題ワードをセットせず空にする
    if (typingWordEl) typingWordEl.innerHTML = '';
    isTypingEnabled = false;
    
    playSoundEffect('start');

    updateFaceMorph(0.0);
    updateSmileMeter(0.0);

    if (timerDisplay) {
      timerDisplay.textContent = '60.0秒';
    }

    if (screenHome && screenGame) {
      screenHome.style.transition = 'opacity 0.3s ease';
      screenGame.style.transition = 'opacity 0.3s ease';

      screenHome.style.opacity = '0';
      screenGame.style.display = 'flex';
      screenGame.style.visibility = 'visible';
      
      void screenGame.offsetWidth;

      screenGame.style.opacity = '1';

      // フェードインの完了（300ms）を待つ
      transitionTimeout = setTimeout(() => {
        screenHome.style.display = 'none';
        transitionTimeout = null;

        // フェードインが完全に終わったここからさらに0.5秒（500ms）待ってからタイピング入力を有効にする
        setTimeout(() => {
          setNextWord(0.0);
          isTypingEnabled = true;
        }, 500);

      }, 300);
    }
  }

  // 最初の1文字が正しく打たれた瞬間に正式スタートする関数
  function startTimerAndPlay() {
    gameState = 'PLAYING';
    startTime = Date.now();

    timerInterval = setInterval(() => {
      const currentElapsed = (Date.now() - startTime) / 1000;
      timeLeft = Math.max(0, 60.0 - currentElapsed);
      elapsedTime = currentElapsed;

      if (timerDisplay) {
        timerDisplay.textContent = timeLeft.toFixed(1) + '秒';
      }
      if (timeLeft <= 0) {
        isTimeoutEnd = true;
        endGame();
      }
    }, 100);
  }

  function setNextWord(progress) {
    if (typeof WordSystem !== 'undefined' && typeof WordSystem.getNextWord === 'function') {
      currentWord = WordSystem.getNextWord(progress);
    } else {
      currentWord = { text: "仏タイピング", romaji: "hotoketaiping" };
    }
    typedLength = 0;
    updateWordDisplay();
  }

  function updateWordDisplay() {
    if (!typingWordEl) return;
    const romaji = currentWord.romaji || currentWord.text;
    const matched = romaji.substring(0, typedLength);
    const remaining = romaji.substring(typedLength);
    
    // ★ ローマ字設定がOFFの場合は非表示にする
    const romajiHtml = isRomajiVisible
      ? `<div style="font-size: 1.1rem; color: #6b7280;"><span style="color: #3b82f6;">${matched}</span>${remaining}</div>`
      : '';

    typingWordEl.innerHTML = `
      <div style="font-size: 1.6rem; margin-bottom: 4px;">${currentWord.text}</div>
      ${romajiHtml}
    `;
  }

  // プレイ画面の笑顔数を更新するヘルパー関数
  function updateSmileCountDisplay() {
    const smileCountEl = document.getElementById('smileCountDisplay');
    if (smileCountEl) {
      smileCountEl.textContent = smileCount;
    }
  }

  // --- 1文字ごとの入力処理・インフレ加算およびメーター進行ロジック ---
  function handleTypingInput(key) {
    const romaji = currentWord.romaji || currentWord.text;
    const expectedChar = romaji[typedLength];
    
    if (gameState === 'WAITING_FIRST_KEY') {
      if (expectedChar && key.toLowerCase() === expectedChar.toLowerCase()) {
        startTimerAndPlay();
      } else {
        return;
      }
    }

    const now = performance.now();
    if (lastKeyTime !== null) {
      const interval = Math.round(now - lastKeyTime);
      keyIntervals.push(interval);

      if (window.hotokeAnticheat && typeof window.hotokeAnticheat.recordKeystroke === 'function') {
        window.hotokeAnticheat.recordKeystroke();
      }
    }
    lastKeyTime = now;

    totalTypedCount++;

    if (expectedChar && key.toLowerCase() === expectedChar.toLowerCase()) {
      typedLength++;
      comboCount++;
      if (comboCount > maxCombo) maxCombo = comboCount;

      playSoundEffect('type');

      if (comboCount >= 5) {
        isComboActive = true;
        triggerComboEffect();
      }

      const comboMultiplier = Math.min(2.5, 1.0 + (comboCount * 0.05));
      const baseProgressStep = 0.025;
      clearedWordsCount += baseProgressStep * comboMultiplier;

      if (clearedWordsCount >= 1.0) {
        // メーターが満タンになった瞬間に端数を持ち越さず、完全に0にリセットする
        clearedWordsCount = 0;

        if (currentSmileStep === 0) {
          smileCount += 1;
        } else {
          smileCount += (currentSmileStep * 100);
        }
        currentSmileStep++;
        updateSmileCountDisplay(); // ★ 笑顔数が増えた瞬間にリアルタイム更新
      }

      const progress = Math.min(Math.max(clearedWordsCount, 0), 1.0);
      updateSmileMeter(progress);
      updateFaceMorph(progress);

      updateWordDisplay();

      if (typedLength >= romaji.length) {
        setNextWord(progress);
      }
    } else {
      missCount++;
      comboCount = 0;
      isComboActive = false;

      playSoundEffect('miss');
    }
  }

  function updateSmileMeter(progress) {
    if (smileMeterFill) {
      const percentage = progress * 100;
      smileMeterFill.style.width = percentage + '%';
    }
  }

  function triggerComboEffect() {
    const comboEl = document.createElement('div');
    comboEl.className = 'combo-popup-effect';
    comboEl.textContent = 'COMBO!';
    comboEl.style.cssText = `
      position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%);
      color: #fef08a; font-weight: bold; font-size: 24px; pointer-events: none;
      animation: floatUpAndDown 1s ease-out forwards; z-index: 50;
    `;
    document.body.appendChild(comboEl);
    setTimeout(() => comboEl.remove(), 1000);
  }

  function endGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'RESULT';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    updateFaceMorph(1.0);
    playSoundEffect('finish');

    savePlayResult();
    showResultOverlay();
  }

  function savePlayResult() {
    const resultData = {
      uuid: window.currentUUID || ('user_' + Math.random().toString(36).substr(2, 9)),
      time: '60.0',
      smileCount: smileCount,
      missCount: missCount,
      accuracy: totalTypedCount > 0 ? ((totalTypedCount - missCount) / totalTypedCount * 100).toFixed(1) : 100,
      maxCombo: maxCombo,
      intervals: keyIntervals,
      face: selectedFace,
      createdAt: new Date().toISOString()
    };

    let history = JSON.parse(localStorage.getItem('hotoke_play_history') || '[]');
    history.unshift(resultData);
    if (history.length > 500) history = history.slice(0, 500);
    localStorage.setItem('hotoke_play_history', JSON.stringify(history));

    updateRankingData(resultData);
    evaluateAndUnlockRanks(resultData);

    if (localStorage.getItem('hotoke_backup')) {
      const autoBackupPayload = {
        history: localStorage.getItem('hotoke_play_history'),
        rankings: localStorage.getItem('hotoke_rankings'),
        unlockedRanks: localStorage.getItem('hotoke_unlocked_ranks'),
        createdAt: new Date().toLocaleString()
      };
      localStorage.setItem('hotoke_backup', JSON.stringify(autoBackupPayload));
    }
  }

  function updateRankingData(data) {
    let rankings = JSON.parse(localStorage.getItem('hotoke_rankings') || '[]');
    const existingIndex = rankings.findIndex(r => r.uuid === data.uuid);
    if (existingIndex >= 0) {
      rankings[existingIndex] = data;
    } else {
      rankings.push(data);
    }
    rankings.sort((a, b) => (b.smileCount || 0) - (a.smileCount || 0));
    localStorage.setItem('hotoke_rankings', JSON.stringify(rankings));
  }

  const rankDefinitions = [
    { id: 1, name: '初めての笑顔', scoreMin: 1, scoreMax: 199 },
    { id: 2, name: 'ルーキースマイルタイパー', scoreMin: 200, scoreMax: 599 },
    { id: 3, name: 'ベーシックスマイルタイパー', scoreMin: 600, scoreMax: 1199 },
    { id: 4, name: 'リラックススマイルタイパー', scoreMin: 1200, scoreMax: 1999 },
    { id: 5, name: 'スムーズスマイルタイパー', scoreMin: 2000, scoreMax: 2999 },
    { id: 6, name: 'リズミカルスマイルタイパー', scoreMin: 3000, scoreMax: 4199 },
    { id: 7, name: 'スピーディースマイルタイパー', scoreMin: 4200, scoreMax: 5599 },
    { id: 8, name: 'クイックスマイルタイパー', scoreMin: 5600, scoreMax: 7199 },
    { id: 9, name: 'フラッシュスマイルタイパー', scoreMin: 7200, scoreMax: 9099 },
    { id: 10, name: 'ネオンスマイルエキスパート', scoreMin: 9100, scoreMax: 11299 },
    { id: 11, name: 'バーストスマイルエキスパート', scoreMin: 11300, scoreMax: 13799 },
    { id: 12, name: 'フラッシュスマイルエキスパート', scoreMin: 13800, scoreMax: 16599 },
    { id: 13, name: 'ボルトスマイルエキスパート', scoreMin: 16600, scoreMax: 19799 },
    { id: 14, name: 'インフィニティスマイルエキスパート', scoreMin: 19800, scoreMax: 23499 },
    { id: 15, name: 'アルティメットスマイルエキスパート', scoreMin: 23500, scoreMax: 27799 },
    { id: 16, name: 'ブレイカースマイルエキスパート', scoreMin: 27800, scoreMax: 32799 },
    { id: 17, name: '絶・スマイルエキスパート', scoreMin: 32800, scoreMax: 38599 },
    { id: 18, name: '帝・スマイルエキスパート', scoreMin: 38600, scoreMax: 45399 },
    { id: 19, name: '超・スマイルエキスパート', scoreMin: 45400, scoreMax: 53199 },
    { id: 20, name: '世界を笑顔にする覇者', scoreMin: 53200, scoreMax: Infinity }
  ];

  window.lastEarnedRankName = '初めての笑顔';

  function evaluateAndUnlockRanks(resultData) {
    const finalScore = resultData.smileCount;

    let currentPlayMatchedRank = rankDefinitions[0];
    rankDefinitions.forEach(rank => {
      if (finalScore >= rank.scoreMin && finalScore <= rank.scoreMax) {
        currentPlayMatchedRank = rank;
      }
    });
    window.lastEarnedRankName = currentPlayMatchedRank.name;

    let unlockedRanks = JSON.parse(localStorage.getItem('hotoke_unlocked_ranks') || '[]');
    let newlyUnlocked = [];

    if (!unlockedRanks.includes(currentPlayMatchedRank.id)) {
      unlockedRanks.push(currentPlayMatchedRank.id);
      newlyUnlocked.push(currentPlayMatchedRank);
    }

    localStorage.setItem('hotoke_unlocked_ranks', JSON.stringify(unlockedRanks));

    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((r, idx) => {
        setTimeout(() => {
          showRankUnlockPopup(r);
        }, idx * 1200);
      });
    }

    updateRankModalUI();
  }

  function showRankUnlockPopup(rankObj) {
    playSoundEffect('start');
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #1e263d, #141a29);
      border: 2px solid #ffd700; color: #fff; padding: 12px 24px;
      border-radius: 30px; box-shadow: 0 5px 20px rgba(255,215,0,0.4);
      z-index: 9999; font-family: 'Segoe UI', sans-serif; text-align: center;
      animation: fadeInOutPopup 3s ease-in-out forwards;
    `;
    popup.innerHTML = `
      <div style="font-size: 0.8rem; color: #ffd700; font-weight: bold;">👑 新しいランクを獲得！</div>
      <div style="font-size: 1.1rem; font-weight: bold;">[Lv.${rankObj.id}] ${rankObj.name}</div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
  }

  // --- ランクカードにカーソルを合わせたときの解放条件表示機能（追加） ---
  function updateRankModalUI() {
    const unlockedRanks = JSON.parse(localStorage.getItem('hotoke_unlocked_ranks') || '[]');
    
    let tooltip = document.getElementById('rankTooltipPopup');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'rankTooltipPopup';
      tooltip.style.cssText = `
        position: fixed; background: rgba(15, 23, 42, 0.95); color: #fff;
        padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; pointer-events: none;
        z-index: 10000; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 1px solid #334155; font-family: 'Segoe UI', sans-serif;
        white-space: pre-line;
      `;
      document.body.appendChild(tooltip);
    }

    rankDefinitions.forEach(rank => {
      const cardItem = document.querySelector(`.rank-card-item[data-id="${rank.id}"]`);
      if (cardItem) {
        const nameSpan = cardItem.querySelector('.rank-card-name');
        const isUnlocked = unlockedRanks.includes(rank.id);

        if (isUnlocked) {
          cardItem.style.filter = 'none';
          cardItem.style.backgroundColor = '';
          if (nameSpan) nameSpan.textContent = rank.name;
        } else {
          cardItem.style.filter = 'grayscale(1)';
          cardItem.style.backgroundColor = 'rgba(20, 26, 41, 0.4)';
          if (nameSpan) nameSpan.textContent = '?';
        }

        if (!cardItem.dataset.tooltipInitialized) {
          cardItem.dataset.tooltipInitialized = 'true';

          cardItem.addEventListener('mouseenter', () => {
            const conditionText = isUnlocked 
              ? `解放済み (笑顔にした回数: ${rank.scoreMin}〜${rank.scoreMax === Infinity ? '∞' : rank.scoreMax}回必要)`
              : `未解放 (笑顔にした回数: ${rank.scoreMin}〜${rank.scoreMax === Infinity ? '∞' : rank.scoreMax}回必要)`;
            
            tooltip.textContent = `[Lv.${rank.id}] ${rank.name}\n${conditionText}`;
            tooltip.style.display = 'block';
          });

          cardItem.addEventListener('mousemove', (e) => {
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
          });

          cardItem.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
          });
        }
      }
    });
  }

  // --- モーダル起動ボタン等のイベント設定 ---
  const openRankModalBtn = document.getElementById('openRankModalBtn');
  if (openRankModalBtn) {
    openRankModalBtn.addEventListener('click', () => {
      updateRankModalUI();
      const rankModal = document.getElementById('rankModal');
      if (rankModal) {
        rankModal.style.display = 'block';
        rankModal.classList.add('modal-overlay-active');
      }
    });
  }

  const openRankingModalBtn = document.getElementById('openRankingModalBtn');
  if (openRankingModalBtn) {
    openRankingModalBtn.addEventListener('click', () => {
      if (typeof window.showRankingModal === 'function') {
        window.showRankingModal();
      } else {
        const rankingModal = document.getElementById('rankingModal');
        if (rankingModal) {
          rankingModal.style.display = 'block';
          rankingModal.classList.add('modal-overlay-active');
        }
      }
    });
  }

  const openPlayRecordBtn = document.getElementById('openPlayRecordBtn');
  if (openPlayRecordBtn) {
    openPlayRecordBtn.addEventListener('click', () => {
      updatePlayRecordData();
      const modal = document.getElementById('playRecordModal');
      if (modal) {
        modal.style.display = 'block';
        modal.classList.add('modal-overlay-active');
      }
    });
  }

  const openFaceModalBtn = document.getElementById('openFaceModalBtn');
  if (openFaceModalBtn) {
    openFaceModalBtn.addEventListener('click', () => {
      initFaceModal();
      const modal = document.getElementById('faceModal');
      if (modal) {
        modal.style.display = 'block';
        modal.classList.add('modal-overlay-active');
      }
    });
  }

  const openSettingsModalBtn = document.getElementById('openSettingsModalBtn');
  if (openSettingsModalBtn) {
    openSettingsModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('settingsModal');
      if (modal) {
        modal.style.display = 'block';
        modal.classList.add('modal-overlay-active');
      }
    });
  }

  const openBackupModalBtn = document.getElementById('openBackupModalBtn');
  if (openBackupModalBtn) {
    openBackupModalBtn.addEventListener('click', () => {
      updateBackupStatusUI();
      const modal = document.getElementById('backupModal');
      if (modal) {
        modal.style.display = 'block';
        modal.classList.add('modal-overlay-active');
      }
    });
  }

  const createBackupBtn = document.getElementById('createBackupBtn');
  if (createBackupBtn) {
    createBackupBtn.addEventListener('click', () => {
      if (localStorage.getItem('hotoke_backup')) {
        showCustomMessageModal('すでにバックアップが存在します。');
        return;
      }
      const backupPayload = {
        history: localStorage.getItem('hotoke_play_history'),
        rankings: localStorage.getItem('hotoke_rankings'),
        unlockedRanks: localStorage.getItem('hotoke_unlocked_ranks'),
        createdAt: new Date().toLocaleString()
      };
      localStorage.setItem('hotoke_backup', JSON.stringify(backupPayload));
      updateBackupStatusUI();
      showCustomMessageModal('バックアップを作成しました');
    });
  }

  // --- プレイデータ削除モーダルの連動処理（バックアップ維持 ＆ 顔を「普通の人」にリセット ＆ 警告音再生） ---
  const openDeleteDataModalBtn = document.getElementById('openDeleteDataModalBtn');
  const deleteDataModal = document.getElementById('deleteDataModal');
  const confirmDeleteDataBtn = document.getElementById('confirmDeleteDataBtn');
  const cancelDeleteDataBtn = document.getElementById('cancelDeleteDataBtn');
  const deleteCompleteModal = document.getElementById('deleteCompleteModal');
  const closeDeleteCompleteBtn = document.getElementById('closeDeleteCompleteBtn');

  if (openDeleteDataModalBtn && deleteDataModal) {
    openDeleteDataModalBtn.addEventListener('click', () => {
      playSoundEffect('delete'); // ★ ここで警告音（delete_warning_sound.mp3）を再生
      deleteDataModal.style.display = 'flex';
      deleteDataModal.classList.add('modal-overlay-active');
    });
  }

  if (cancelDeleteDataBtn && deleteDataModal) {
    cancelDeleteDataBtn.addEventListener('click', () => {
      deleteDataModal.style.display = 'none';
      deleteDataModal.classList.remove('modal-overlay-active');
    });
  }

  if (confirmDeleteDataBtn && deleteDataModal) {
    confirmDeleteDataBtn.addEventListener('click', () => {
      // ローカルストレージのゲーム関連データを消去（hotoke_backup は維持）
      localStorage.removeItem('hotoke_play_history');
      localStorage.removeItem('hotoke_rankings');
      localStorage.removeItem('hotoke_unlocked_ranks');

      // 選択中の顔を「普通の人 (normal)」にリセットして保存
      if (typeof window.setSelectedFace === 'function') {
        window.setSelectedFace('normal');
      } else {
        localStorage.setItem('hotoke_selected_face', 'normal');
      }

      // 削除確認モーダルを非表示にする
      deleteDataModal.style.display = 'none';
      deleteDataModal.classList.remove('modal-overlay-active');

      // 削除完了モーダルを表示する
      if (deleteCompleteModal) {
        deleteCompleteModal.style.display = 'flex';
        deleteCompleteModal.classList.add('modal-overlay-active');
      }
    });
  }

  if (closeDeleteCompleteBtn && deleteCompleteModal) {
    closeDeleteCompleteBtn.addEventListener('click', () => {
      deleteCompleteModal.style.display = 'none';
      deleteCompleteModal.classList.remove('modal-overlay-active');
      window.location.reload(); // 画面をリロードして反映
    });
  }

  document.querySelectorAll('.btn-close-modal, .close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target');
      if (targetId) {
        const modal = document.getElementById(targetId);
        if (modal) {
          modal.style.display = 'none';
          modal.classList.remove('modal-overlay-active');
        }
      } else {
        const modal = btn.closest('.modal, .modal-overlay, div[id$="Modal"]');
        if (modal) {
          modal.style.display = 'none';
          modal.classList.remove('modal-overlay-active');
        }
      }
    });
  });

  updateRankModalUI();
  updateBackupStatusUI();

  // --- リザルト画面（全ボタン完備版） ---
  function showResultOverlay() {
    const faceLabel = faceNames[selectedFace] || '人';
    const earnedRankDisplay = window.lastEarnedRankName || '初めての笑顔';

    const mainResultText = `1分間で<br>${smileCount}回${faceLabel}を笑顔にしました`;

    const overlay = document.createElement('div');
    overlay.id = 'gameResultOverlay';
    overlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 100; box-sizing: border-box; pointer-events: none;
    `;

    overlay.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; padding: 24px; width: 340px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); text-align: center; position: relative; pointer-events: auto; font-family: 'Segoe UI', sans-serif;">
        
        <div style="width: 140px; height: 140px; background: #f8fafc; border: 4px solid #1f2937; clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; line-height: 1.4; color: #1f2937; text-align: center; padding: 10px; box-sizing: border-box;">
          ${mainResultText}
        </div>

        <div style="background: #f1f5f9; border: 2px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 25px; font-weight: bold; color: #334155; font-size: 14px; position: relative;">
          ランク: ${earnedRankDisplay}
        </div>

        <button id="resultOpenRankBtn" style="position: absolute; left: 15px; bottom: 75px; background: #2563eb; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
          獲得したランクを見る
        </button>

        <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
          <button id="resBackHomeBtn" title="ホームに戻る" style="width: 42px; height: 42px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">🏠</button>
          <button id="resRestartBtn" title="もう一度" style="width: 42px; height: 42px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">🔄</button>
          <button id="resOverviewBtn" title="概要" style="width: 42px; height: 42px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">📋</button>
          <button id="resShareXBtn" title="Xにポスト" style="width: 42px; height: 42px; background: #000000; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <img src="../assets/img/x.png" alt="X" style="width: 18px; height: 18px; object-fit: contain;">
          </button>
          <button id="resRankingBtn" title="ランキング" style="height: 42px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; padding: 0 12px; font-weight: bold; font-size: 12px; color: #1e293b;">ランキング</button>
        </div>

      </div>
    `;

    if (screenGame) screenGame.appendChild(overlay);

    document.getElementById('resBackHomeBtn').addEventListener('click', () => {
      overlay.remove();
      returnToHome();
    });

    document.getElementById('resRestartBtn').addEventListener('click', () => {
      overlay.remove();
      setupGameScreen();
    });

    document.getElementById('resultOpenRankBtn').addEventListener('click', () => {
      updateRankModalUI();
      const rankModal = document.getElementById('rankModal');
      if (rankModal) {
        rankModal.style.display = 'block';
        rankModal.classList.add('modal-overlay-active');
      }
    });

    document.getElementById('resOverviewBtn').addEventListener('click', () => {
      showOverviewTab();
    });

    document.getElementById('resShareXBtn').addEventListener('click', () => {
      const postText = `1分間で${faceLabel}を${smileCount}回笑顔にしました！（正確率：${totalTypedCount > 0 ? ((totalTypedCount - missCount) / totalTypedCount * 100).toFixed(1) : '100.0'}%、タイプミス：${missCount}Key）\n#仏タイピング https://hotoke-typing.net`;
      const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(postText)}`;
      window.open(tweetUrl, '_blank');
    });

    document.getElementById('resRankingBtn').addEventListener('click', () => {
      showRankingTab(smileCount);
    });
  }

  function showOverviewTab() {
    const kpsAvg = elapsedTime > 0 ? (totalTypedCount / elapsedTime).toFixed(2) : '0.00';
    const accuracyVal = totalTypedCount > 0 ? ((totalTypedCount - missCount) / totalTypedCount * 100).toFixed(1) : '100.0';

    const tab = document.createElement('div');
    tab.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center;
      font-family: 'Segoe UI', sans-serif;
    `;
    tab.innerHTML = `
      <div style="background: #ffffff; padding: 25px; border-radius: 12px; width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); text-align: center; position: relative;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 1.2rem;">プレイ概要</h3>
        <div style="text-align: left; margin: 20px 0; font-size: 14px; color: #334155; line-height: 1.8;">
          <div>・笑顔スコア総数: <b>${smileCount} 回</b></div>
          <div>・1秒当たりの平均タイプ数: <b>${kpsAvg} 回/秒</b></div>
          <div>・コンボの最大継続: <b>${maxCombo} 回</b></div>
          <div>・正確率: <b>${accuracyVal}%</b></div>
        </div>
        <button id="closeOverviewTabBtn" style="background: #64748b; color: #fff; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">閉じる</button>
      </div>
    `;
    document.body.appendChild(tab);

    document.getElementById('closeOverviewTabBtn').addEventListener('click', () => {
      tab.remove();
    });
  }

  function showRankingTab(currentSmileCount) {
    const tab = document.createElement('div');
    tab.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center;
      font-family: 'Segoe UI', sans-serif;
    `;

    let rankings = JSON.parse(localStorage.getItem('hotoke_rankings') || '[]');
    let totalPlayers = rankings.length;
    if (totalPlayers > 5000) totalPlayers = 5000;
    if (totalPlayers < 1) totalPlayers = 1;

    let myRank = 1;
    for (let i = 0; i < rankings.length; i++) {
      if ((rankings[i].smileCount || 0) > currentSmileCount) {
        myRank++;
      }
    }
    if (myRank > 5000) myRank = 5000;

    tab.innerHTML = `
      <div style="background: #ffffff; padding: 25px; border-radius: 12px; width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); text-align: center; position: relative;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 1.2rem;">ランキング</h3>
        <div style="margin: 25px 0; font-size: 18px; color: #1e293b; display: flex; align-items: center; justify-content: center; gap: 10px;">
          <span style="color: #cbd5e1; font-size: 20px;">❖</span>
          <span><b>${totalPlayers}人中</b> <span style="font-size: 24px; color: #2563eb; font-weight: bold;">${myRank}位</span></span>
          <span style="color: #cbd5e1; font-size: 20px;">❖</span>
        </div>
        <button id="closeRankingTabBtn" style="background: #64748b; color: #fff; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">閉じる</button>
      </div>
    `;

    document.body.appendChild(tab);

    document.getElementById('closeRankingTabBtn').addEventListener('click', () => {
      tab.remove();
    });
  }

  function returnToHome() {
    gameState = 'HOME';
    isTypingEnabled = false;

    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (screenHome && screenGame) {
      screenHome.style.transition = 'opacity 0.3s ease';
      screenGame.style.transition = 'opacity 0.3s ease';

      screenGame.style.opacity = '0';
      screenHome.style.display = 'flex';

      void screenHome.offsetWidth;

      screenHome.style.opacity = '1';

      transitionTimeout = setTimeout(() => {
        screenGame.style.display = 'none';
        transitionTimeout = null;
      }, 300);
    }
  }

  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === 'hotoke_play_history') {
      if (gameState === 'PLAYING' || gameState === 'WAITING_FIRST_KEY') {
        returnToHome();
      }
    }
  });
});