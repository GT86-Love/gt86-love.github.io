/* ==========================================
   仏タイピング - ランキング管理スクリプト (ranking.js) - LocalStorage版
   ========================================== */

const HOTOKE_RANKINGS_STORAGE_KEY = 'hotoke_rankings';

function readHotokeRankings() {
  try {
    const raw = localStorage.getItem(HOTOKE_RANKINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeHotokeRankings(list) {
  localStorage.setItem(HOTOKE_RANKINGS_STORAGE_KEY, JSON.stringify(list));
}

export async function saveRankingToLocalStorage(input = {}) {
  try {
    const uuid = input.uuid || '';
    const score = parseInt(input.score, 10) || 0;
    const time = parseFloat(input.time) || 0.0;

    if (!uuid) {
      return {
        ok: false,
        status: 400,
        body: { error: 'UUID is required' }
      };
    }

    const rankings = readHotokeRankings();
    const updatedAt = new Date().toISOString();
    const existingIndex = rankings.findIndex((item) => item.uuid === uuid);

    if (existingIndex === -1) {
      rankings.push({
        uuid,
        score,
        clear_time: time,
        updated_at: updatedAt
      });
    } else {
      const current = rankings[existingIndex];
      const currentScore = parseInt(current.score, 10) || 0;
      const nextScore = Math.max(currentScore, score);

      const currentClearTime = current.clear_time;
      let nextClearTime;
      if (currentClearTime === 0 || currentClearTime === null || currentClearTime === undefined) {
        nextClearTime = time;
      } else {
        nextClearTime = Math.min(parseFloat(currentClearTime), time);
      }

      rankings[existingIndex] = {
        ...current,
        uuid,
        score: nextScore,
        clear_time: nextClearTime,
        updated_at: updatedAt
      };
    }

    writeHotokeRankings(rankings);

    return {
      ok: true,
      status: 200,
      body: { success: true, message: 'Ranking updated' }
    };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      body: { error: 'Storage error: ' + e.message }
    };
  }
}

export async function getRankingsFromLocalStorage() {
  try {
    const rankings = readHotokeRankings();
    const sorted = [...rankings]
      .sort((a, b) => {
        const scoreA = parseInt(a.score, 10) || 0;
        const scoreB = parseInt(b.score, 10) || 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        const timeA = parseFloat(a.clear_time) || 0;
        const timeB = parseFloat(b.clear_time) || 0;
        return timeA - timeB;
      })
      .slice(0, 50)
      .map((item) => ({
        uuid: item.uuid,
        score: item.score,
        clear_time: item.clear_time
      }));

    return {
      ok: true,
      status: 200,
      body: { success: true, rankings: sorted }
    };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      body: { error: 'Storage error: ' + e.message }
    };
  }
}

window.HotokeRankingStorage = {
  saveRanking: saveRankingToLocalStorage,
  getRankings: getRankingsFromLocalStorage
};