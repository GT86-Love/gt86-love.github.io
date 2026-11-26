/**
 * 仏タイピング - ローマ字入力エンジン（表示・入力ルール確定版）
 */
const RomajiEngine = (() => {
  function toHiragana(str = "") {
    return str.replace(/[\u30a1-\u30f6]/g, ch =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    );
  }

  // 2文字セット（拗音・外来音・特殊音）
  // 配列の先頭[0]がデフォルト表示になる
  const COMBO_PATTERNS = {
    "しゃ": ["sya", "sha", "cya", "shya"],
    "しゅ": ["syu", "shu", "cyu", "shyu"],
    "しょ": ["syo", "sho", "cyo", "shyo"],
    "しぇ": ["sye", "she", "cye"],

    "ちゃ": ["tya", "cha", "cya", "tchya"],
    "ちゅ": ["tyu", "chu", "cyu", "tchyu"],
    "ちょ": ["tyo", "cho", "cyo", "tchyo"],
    "ちぇ": ["tye", "che", "cye"],

    "じゃ": ["zya", "ja", "jya"],
    "じゅ": ["zyu", "ju", "jyu"],
    "じょ": ["zyo", "jo", "jyo"],
    "じぇ": ["zye", "je", "jye"],

    "にゃ": ["nya"],
    "にゅ": ["nyu"],
    "にょ": ["nyo"],

    "きゃ": ["kya"],
    "きゅ": ["kyu"],
    "きょ": ["kyo"],

    "ひゃ": ["hya"],
    "ひゅ": ["hyu"],
    "ひょ": ["hyo"],

    "びゃ": ["bya"],
    "びゅ": ["byu"],
    "びょ": ["byo"],

    "ぴゃ": ["pya"],
    "ぴゅ": ["pyu"],
    "ぴょ": ["pyo"],

    "みゃ": ["mya"],
    "みゅ": ["myu"],
    "みょ": ["myo"],

    "りゃ": ["rya", "lya"],
    "りゅ": ["ryu", "lyu"],
    "りょ": ["ryo", "lyo"],

    // 外来音・特殊音（「てぃ」は ti 不可、thi / t'i のみ）
    "てぃ": ["thi", "t'i"],
    "でぃ": ["dhi", "d'i"],
    "とぅ": ["twu", "t'u"],
    "どぅ": ["dwu", "d'u"],

    "ふぁ": ["fa", "hua", "fwa"],
    "ふぃ": ["fi", "hui", "fwi"],
    "ふぇ": ["fe", "hue", "fwe"],
    "ふぉ": ["fo", "huo", "fwo"],
    "ふゅ": ["fyu", "huyu"],

    "うぃ": ["wi", "uli", "uxi", "ui"],
    "うぇ": ["we", "ule", "uxe", "ue"],
    "うぉ": ["who", "ulo", "uxo", "uo"],

    "ゔぁ": ["va", "bua"],
    "ゔぃ": ["vi", "bui"],
    "ゔぇ": ["ve", "bue"],
    "ゔぉ": ["vo", "buo"],
    "ゔゅ": ["vyu", "buyu"],

    "くぁ": ["kwa", "kua"],
    "くぃ": ["kwi", "kui"],
    "くぇ": ["kwe", "kue"],
    "くぉ": ["kwo", "kuo"],

    "ぐぁ": ["gwa", "gua"],
    "ぐぃ": ["gwi", "gui"],
    "ぐぇ": ["gwe", "gue"],
    "ぐぉ": ["gwo", "guo"],

    "いぇ": ["ye", "ixe", "ile"]
  };

  // 1文字かな（配列の先頭[0]がデフォルト表示）
  const SINGLE_PATTERNS = {
    "あ": ["a"],
    "い": ["i", "yi"],
    "う": ["u", "wu", "whu"],
    "え": ["e"],
    "お": ["o"],

    "か": ["ka", "ca"],
    "き": ["ki"],
    "く": ["ku", "cu", "qu"],
    "け": ["ke"],
    "こ": ["ko", "co"],

    "さ": ["sa"],
    "し": ["si", "shi", "ci"],
    "す": ["su"],
    "せ": ["se", "ce"],
    "そ": ["so"],

    "た": ["ta"],
    "ち": ["ti", "chi", "ci"],
    "つ": ["tu", "tsu"],
    "て": ["te"],
    "と": ["to"],

    "な": ["na"],
    "に": ["ni"],
    "ぬ": ["nu"],
    "ね": ["ne"],
    "の": ["no"],

    "は": ["ha"],
    "ひ": ["hi"],
    "ふ": ["hu", "fu"],
    "へ": ["he"],
    "ほ": ["ho"],

    "ま": ["ma"],
    "み": ["mi"],
    "む": ["mu"],
    "め": ["me"],
    "も": ["mo"],

    "や": ["ya"],
    "ゆ": ["yu"],
    "よ": ["yo"],

    "ら": ["ra"],
    "り": ["ri"],
    "る": ["ru"],
    "れ": ["re"],
    "ろ": ["ro"],

    "わ": ["wa"],
    "ゐ": ["wi"],
    "ゑ": ["we"],
    "を": ["wo", "o"],

    "が": ["ga"],
    "ぎ": ["gi"],
    "ぐ": ["gu"],
    "げ": ["ge"],
    "ご": ["go"],

    "ざ": ["za"],
    "じ": ["zi", "ji"],
    "ず": ["zu"],
    "ぜ": ["ze"],
    "ぞ": ["zo"],

    "だ": ["da"],
    "ぢ": ["di", "zi", "ji"],
    "づ": ["du", "zu", "tsu"],
    "で": ["de"],
    "ど": ["do"],

    "ば": ["ba"],
    "び": ["bi"],
    "ぶ": ["bu"],
    "べ": ["be"],
    "ぼ": ["bo"],

    "ぱ": ["pa"],
    "ぴ": ["pi"],
    "ぷ": ["pu"],
    "ぺ": ["pe"],
    "ぽ": ["po"],

    "ゔ": ["vu", "bu"],

    // 小書き
    "ぁ": ["xa", "la", "a"],
    "ぃ": ["xi", "li", "i"],
    "ぅ": ["xu", "lu", "u"],
    "ぇ": ["xe", "le", "e"],
    "ぉ": ["xo", "lo", "o"],
    "ゃ": ["xya", "lya", "ya"],
    "ゅ": ["xyu", "lyu", "yu"],
    "ょ": ["xyo", "lyo", "yo"],
    "ゎ": ["xwa", "lwa", "wa"],

    // 記号・長音
    "ー": ["-"],
    "？": ["?"],
    "?": ["?"],
    "！": ["!"],
    "!": ["!"],
    "・": ["/"],
    "、": [","],
    "。": ["."]
  };

  // 小書きの分解打ち展開用マップ
  const SMALL_KANA_EXPAND = {
    "ゃ": ["xya", "lya"],
    "ゅ": ["xyu", "lyu"],
    "ょ": ["xyo", "lyo"],
    "ぁ": ["xa", "la"],
    "ぃ": ["xi", "li"],
    "ぅ": ["xu", "lu"],
    "ぇ": ["xe", "le"],
    "ぉ": ["xo", "lo"],
    "ゎ": ["xwa", "lwa"]
  };

  const VOWELS = new Set(["a", "i", "u", "e", "o"]);
  const NON_DOUBLABLE = new Set(["a", "i", "u", "e", "o", "n", "'", "-", "?", "!", "/", ",", ".", "x", "l"]);

  function buildComboCandidates(two) {
    const base = [...(COMBO_PATTERNS[two] || [])];
    const firstCh = two[0];
    const secondCh = two[1];
    const baseCharMap = {
      "き": "ki", "し": "si", "ち": "ti", "に": "ni", "ひ": "hi", "み": "mi", "り": "ri",
      "ぎ": "gi", "じ": "zi", "ぢ": "di", "び": "bi", "ぴ": "pi",
      "く": "ku", "ぐ": "gu", "ふ": "hu", "う": "u", "ゔ": "vu", "て": "te", "で": "de", "い": "i"
    };
    const prefix = baseCharMap[firstCh];
    const smallSuffixes = SMALL_KANA_EXPAND[secondCh];
    if (prefix && smallSuffixes) {
      for (const s of smallSuffixes) {
        const comb = prefix + s;
        if (!base.includes(comb)) {
          base.push(comb);
        }
      }
    }
    return base;
  }

  function tokenize(rawKana) {
    const kana = toHiragana(rawKana);
    const tokens = [];
    let i = 0;

    while (i < kana.length) {
      const two = kana.slice(i, i + 2);
      if (COMBO_PATTERNS[two]) {
        tokens.push({
          type: "combo",
          kana: two,
          candidates: buildComboCandidates(two)
        });
        i += 2;
        continue;
      }

      const ch = kana[i];
      if (ch === "っ") {
        tokens.push({
          type: "sokuon",
          kana: ch,
          candidates: ["ltu", "xtu", "ltsu", "xtsu"]
        });
      } else if (ch === "ん") {
        tokens.push({
          type: "n",
          kana: ch,
          candidates: ["nn", "n'"]
        });
      } else if (SINGLE_PATTERNS[ch]) {
        tokens.push({
          type: "single",
          kana: ch,
          candidates: [...SINGLE_PATTERNS[ch]]
        });
      } else {
        tokens.push({
          type: "raw",
          kana: ch,
          candidates: [ch.toLowerCase()]
        });
      }
      i += 1;
    }

    // 文脈に応じた促音（っ）と撥音（ん）の追加打ち方付与
    for (let idx = 0; idx < tokens.length; idx++) {
      const cur = tokens[idx];
      const next = tokens[idx + 1];

      if (cur.type === "sokuon" && next) {
        const doubled = new Set(cur.candidates);
        for (const cand of next.candidates) {
          const first = cand[0];
          if (first && !NON_DOUBLABLE.has(first)) {
            doubled.add(first);
          }
        }
        cur.candidates = Array.from(doubled);
      }

      if (cur.type === "n") {
        if (!next) {
          // 語尾（「スマートフォン」など最後）の「ん」は nn / n' のみ（単発 n 不可）
          cur.candidates = ["nn", "n'"];
          cur.isEnd = true;
        } else {
          // 途中（「サンマ」など）の「ん」は、次トークンが母音・y・n・' 始まりでなければ単発 n も許可
          cur.isEnd = false;
          const hasAmbiguousNext = next.candidates.some(c => {
            const first = c[0];
            return !first || VOWELS.has(first) || first === "y" || first === "n" || first === "'";
          });
          if (!hasAmbiguousNext) {
            cur.candidates = ["n", "nn", "n'"];
          } else {
            cur.candidates = ["nn", "n'"];
          }
        }
      }
    }

    return tokens;
  }

  function createSession(kanaOrFallback) {
    const tokens = tokenize(kanaOrFallback);
    return {
      tokens,
      tokenIndex: 0,
      buffer: "",
      typedHistory: "",
      completed: tokens.length === 0
    };
  }

  function getMatchingCandidates(token, buffer) {
    if (!token) return [];
    if (!buffer) return token.candidates;
    return token.candidates.filter(c => c.startsWith(buffer));
  }

  // トークンのデフォルト表示文字列を取得
  function getTokenDefaultDisplay(tokens, idx) {
    const t = tokens[idx];
    if (!t) return "";

    if (t.type === "sokuon") {
      const nextTok = tokens[idx + 1];
      const nextFirst = nextTok?.candidates?.[0]?.[0];
      if (nextFirst && !NON_DOUBLABLE.has(nextFirst)) {
        return nextFirst;
      }
      return "ltu";
    }

    if (t.type === "n") {
      // 語尾（最後）は nn、途中は n をデフォルト表示
      return t.isEnd ? "nn" : "n";
    }

    return t.candidates[0] || "";
  }

  /**
   * 画面表示用のガイド文字列
   * デフォルト表示を崩さず、入力中のbufferに合う候補があればそれを優先して残りを出す
   */
  function getDisplayGuide(session) {
    if (!session || session.completed) {
      return { typed: session?.typedHistory || "", remaining: "", full: session?.typedHistory || "" };
    }

    const curToken = session.tokens[session.tokenIndex];
    const matching = getMatchingCandidates(curToken, session.buffer);

    let activeCand = getTokenDefaultDisplay(session.tokens, session.tokenIndex);
    if (session.buffer.length > 0 && matching.length > 0) {
      if (!matching.includes(activeCand)) {
        activeCand = matching[0];
      }
    }

    const curRemaining = activeCand.startsWith(session.buffer)
      ? activeCand.slice(session.buffer.length)
      : activeCand;

    let futureRemaining = "";
    for (let i = session.tokenIndex + 1; i < session.tokens.length; i++) {
      futureRemaining += getTokenDefaultDisplay(session.tokens, i);
    }

    return {
      typed: session.typedHistory,
      remaining: curRemaining + futureRemaining,
      full: session.typedHistory + curRemaining + futureRemaining
    };
  }

  function inputKey(session, rawKey) {
    if (!session || session.completed) {
      return { status: "completed", session };
    }
    if (typeof rawKey !== "string" || rawKey.length !== 1) {
      return { status: "miss", session };
    }

    const key = rawKey.toLowerCase();
    const curToken = session.tokens[session.tokenIndex];

    // 途中の「ん」で1個目の 'n' を打った直後（buffer === 'n'）の処理
    if (curToken.type === "n" && session.buffer === "n") {
      if (key === "n" && curToken.candidates.includes("nn")) {
        session.typedHistory += key;
        session.tokenIndex += 1;
        session.buffer = "";
        if (session.tokenIndex >= session.tokens.length) {
          session.completed = true;
          return { status: "completed", session };
        }
        return { status: "token_done", session };
      }

      if (key === "'" && curToken.candidates.includes("n'")) {
        session.typedHistory += key;
        session.tokenIndex += 1;
        session.buffer = "";
        if (session.tokenIndex >= session.tokens.length) {
          session.completed = true;
          return { status: "completed", session };
        }
        return { status: "token_done", session };
      }

      if (curToken.candidates.includes("n")) {
        const nextToken = session.tokens[session.tokenIndex + 1];
        if (nextToken && nextToken.candidates.some(c => c.startsWith(key))) {
          session.tokenIndex += 1;
          session.buffer = "";
          return inputKey(session, key);
        }
      }

      return { status: "miss", session };
    }

    const nextBuffer = session.buffer + key;
    const matched = curToken.candidates.filter(c => c.startsWith(nextBuffer));
    if (matched.length > 0) {
      if (curToken.type === "n" && nextBuffer === "n" && (curToken.candidates.includes("nn") || curToken.candidates.includes("n'"))) {
        session.buffer = nextBuffer;
        session.typedHistory += key;
        return { status: "hit", session };
      }

      session.buffer = nextBuffer;
      session.typedHistory += key;

      const exact = matched.find(c => c === nextBuffer);
      if (exact) {
        session.tokenIndex += 1;
        session.buffer = "";
        if (session.tokenIndex >= session.tokens.length) {
          session.completed = true;
          return { status: "completed", session };
        }
        return { status: "token_done", session };
      }

      return { status: "hit", session };
    }

    return { status: "miss", session };
  }

  return {
    toHiragana,
    tokenize,
    createSession,
    getDisplayGuide,
    inputKey
  };
})();