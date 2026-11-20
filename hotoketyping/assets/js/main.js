/* ==========================================
   仏タイピング - メイン初期化スクリプト (main.js) - 完全版
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // UUID v4 生成・取得管理
  function getOrCreateUUID() {
    let uuid = localStorage.getItem('hotoke_user_uuid');
    if (!uuid) {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      localStorage.setItem('hotoke_user_uuid', uuid);
    }
    return uuid;
  }
  window.currentUUID = getOrCreateUUID();
});