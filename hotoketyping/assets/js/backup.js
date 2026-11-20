/* ==========================================
   仏タイピング - バックアップ管理スクリプト (backup.js) - LocalStorage版
   ========================================== */

const HOTOKE_BACKUP_STORAGE_PREFIX = 'hotoke_backup_';

function getHotokeBackupStorageKey(uuid) {
  return `${HOTOKE_BACKUP_STORAGE_PREFIX}${uuid}`;
}

export async function saveBackupToLocalStorage(input = {}) {
  try {
    const uuid = input.uuid || '';
    const backupData = input.backup_data ?? '';

    if (!uuid) {
      return {
        ok: false,
        status: 400,
        body: { error: 'UUID is required' }
      };
    }

    // PHPの is_array || is_object 判定に相当する処理
    let encodedBackupData = backupData;
    if (typeof backupData === 'object' && backupData !== null) {
      encodedBackupData = JSON.stringify(backupData);
    }

    const updatedAt = new Date().toISOString();
    const record = {
      uuid,
      backup_data: encodedBackupData,
      updated_at: updatedAt
    };

    localStorage.setItem(getHotokeBackupStorageKey(uuid), JSON.stringify(record));

    return {
      ok: true,
      status: 200,
      body: { success: true, message: 'Backup saved successfully' }
    };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      body: { error: 'Storage error: ' + e.message }
    };
  }
}

export async function loadBackupFromLocalStorage(uuid = '') {
  if (!uuid) {
    return {
      ok: false,
      status: 400,
      body: { error: 'UUID is required' }
    };
  }

  try {
    const raw = localStorage.getItem(getHotokeBackupStorageKey(uuid));
    const result = raw ? JSON.parse(raw) : null;

    if (result) {
      let decodedData = result.backup_data;
      try {
        const parsedData = JSON.parse(decodedData);
        if (parsedData !== null) {
          decodedData = parsedData;
        }
      } catch (err) {
        // JSONパースに失敗した場合は元の文字列のまま保持する
      }

      return {
        ok: true,
        status: 200,
        body: {
          success: true,
          backup_data: decodedData,
          updated_at: result.updated_at
        }
      };
    } else {
      return {
        ok: true,
        status: 200,
        body: { success: false, message: 'No backup found' }
      };
    }
  } catch (e) {
    return {
      ok: false,
      status: 500,
      body: { error: 'Storage error: ' + e.message }
    };
  }
}

window.HotokeBackupStorage = {
  saveBackup: saveBackupToLocalStorage,
  loadBackup: loadBackupFromLocalStorage
};