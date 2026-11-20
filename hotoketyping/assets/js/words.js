/* ==========================================
   仏タイピング - 単語・文章データ & 生成システム (words.js) - 完全版
   ========================================== */

const WordSystem = {
  // 1. 序盤用：2〜4文字の短い単語・日常語・動物・自然
  earlyWords: [
    { text: "象", romaji: "zou" },
    { text: "サル", romaji: "saru" },
    { text: "犬", romaji: "inu" },
    { text: "猫", romaji: "neko" },
    { text: "鳥", romaji: "tori" },
    { text: "虫", romaji: "musi" },
    { text: "魚", romaji: "sakana" },
    { text: "牛", romaji: "usi" },
    { text: "馬", romaji: "uma" },
    { text: "羊", romaji: "hituzi" },
    { text: "鹿", romaji: "sika" },
    { text: "熊", romaji: "kuma" },
    { text: "狐", romaji: "kitune" },
    { text: "狸", romaji: "tanuki" },
    { text: "蛇", romaji: "hebi" },
    { text: "蛙", romaji: "kaeru" },
    { text: "蟹", romaji: "kani" },
    { text: "貝", romaji: "kai" },
    { text: "朝", romaji: "asa" },
    { text: "夜", romaji: "yoru" },
    { text: "海", romaji: "umi" },
    { text: "山", romaji: "yama" },
    { text: "川", romaji: "kawa" },
    { text: "空", romaji: "sora" },
    { text: "雨", romaji: "ame" },
    { text: "雪", romaji: "yuki" },
    { text: "風", romaji: "kaze" },
    { text: "月", romaji: "tuki" },
    { text: "学校", romaji: "gakkou" },
    { text: "星", romaji: "hosi" },
    { text: "花", romaji: "hana" },
    { text: "草", romaji: "kusa" },
    { text: "木", romaji: "ki" },
    { text: "森", romaji: "mori" },
    { text: "林", romaji: "hayasi" },
    { text: "池", romaji: "ike" },
    { text: "サンマ", romaji: "sanma" },
    { text: "ファイル", romaji: "fairu" },
    { text: "本", romaji: "honn" },
    { text: "机", romaji: "tukue" },
    { text: "椅子", romaji: "isu" },
    { text: "窓", romaji: "mado" },
    { text: "ドア", romaji: "doa" },
    { text: "靴", romaji: "kutu" },
    { text: "服", romaji: "huku" },
    { text: "鍵", romaji: "kagi" },
    { text: "時計", romaji: "tokei" },
    { text: "鏡", romaji: "kagami" },
    { text: "箸", romaji: "hasi" },
    { text: "鉛筆", romaji: "enpitu" },
    { text: "ペン", romaji: "penn" },
    { text: "ノート", romaji: "no-to" },
    { text: "紙", romaji: "kami" },
    { text: "ハサミ", romaji: "hasami" },
    { text: "箱", romaji: "hako" },
    { text: "袋", romaji: "hukuro" },
    { text: "傘", romaji: "kasa" },
    { text: "旗", romaji: "hata" },
    { text: "鈴", romaji: "suzu" },
    { text: "球", romaji: "tama" },
    { text: "縄", romaji: "nawa" },
    { text: "網", romaji: "ami" },
    { text: "杖", romaji: "tue" },
    { text: "盾", romaji: "tate" },
    { text: "剣", romaji: "kenn" },
    { text: "今日", romaji: "kyou" },
    { text: "アサリ", romaji: "asari" },
    { text: "鉄球", romaji: "tekkyuu" },
    { text: "作家", romaji: "sakka" },
    { text: "作曲家", romaji: "sakkyokuka" },
    { text: "漫画家", romaji: "mangaka" },
    { text: "パニック", romaji: "panikku" },
    { text: "サーモン", romaji: "sa-monn" },
    { text: "マグロ", romaji: "maguro" },
    { text: "イカ", romaji: "ika" },
    { text: "トラ", romaji: "tora" },
    { text: "パンダ", romaji: "panda" },
    { text: "消しゴム", romaji: "kesigomu" },
    { text: "カバン", romaji: "kabann" },
    { text: "歯ブラシ", romaji: "haburasi" },
    { text: "定規", romaji: "zyougi" },
    { text: "スマホ", romaji: "sumaho" },
    { text: "絵の具", romaji: "enogu" },
    { text: "切手", romaji: "kitte" },
    { text: "拍手", romaji: "hakusyu" },
    { text: "祭り", romaji: "maturi" },
    { text: "病気", romaji: "byouki" },
    { text: "温泉", romaji: "onsenn" },
    { text: "テキスト", romaji: "tekisuto" },
    { text: "白菜", romaji: "hakusai" },
    { text: "トマト", romaji: "tomato" },
    { text: "レタス", romaji: "retasu" },
    { text: "パズル", romaji: "pazuru" },
    { text: "ゲーム", romaji: "ge-mu" },
    { text: "会社", romaji: "kaisya" },
    { text: "歩く", romaji: "aruku" },
    { text: "天井", romaji: "tenzyou" },
    { text: "お店", romaji: "omise" },
    { text: "ポスト", romaji: "posuto" },
    { text: "薬", romaji: "kusuri" },
    { text: "ローマ字", romaji: "romazi" },
    { text: "戦国", romaji: "sengoku" },
    { text: "布団", romaji: "hutonn" },
    { text: "毛布", romaji: "mouhu" },
    { text: "戦場", romaji: "senzyou" },
    { text: "人影", romaji: "hitokage" },
    { text: "カーテン", romaji: "ka-tenn" },
    { text: "ミス", romaji: "misu" }
  ],

  // 2. 中盤用：4〜7文字の単語・日常語・生き物・モノ
  midWords: [
    { text: "水しぶき", romaji: "mizusibuki" },
    { text: "オカリナ", romaji: "okarina" },
    { text: "トランペット", romaji: "toranpetto" },
    { text: "ハムスター", romaji: "hamusuta-" },
    { text: "引っ越し", romaji: "hikkosi" },
    { text: "ハリネズミ", romaji: "harinezumi" },
    { text: "コンセント", romaji: "konsento" },
    { text: "冷蔵庫", romaji: "reizouko" },
    { text: "洗濯機", romaji: "sentakuki" },
    { text: "電子レンジ", romaji: "densirenzi" },
    { text: "スマートフォン", romaji: "suma-tofonn" },
    { text: "イヤホン", romaji: "iyahonn" },
    { text: "プログラミング", romaji: "puroguramingu" },
    { text: "キーボード", romaji: "ki-bo-do" },
    { text: "ディスプレイ", romaji: "dhisupurei" },
    { text: "ネットワーク", romaji: "nettowa-ku" },
    { text: "データベース", romaji: "de-tabe-su" },
    { text: "セキュリティ", romaji: "sekyurithi" },
    { text: "ひまわり", romaji: "himawari" },
    { text: "チューリップ", romaji: "tyu-rippu" },
    { text: "タンポポ", romaji: "tanpopo" },
    { text: "アスパラガス", romaji: "asuparagasu" },
    { text: "ブロッコリー", romaji: "burokkori-" },
    { text: "ハンバーグ", romaji: "hanba-gu" },
    { text: "フライパン", romaji: "huraipann" },
    { text: "スプーン", romaji: "supu-nn" },
    { text: "フォーク", romaji: "fo-ku" },
    { text: "ストロー", romaji: "sutoro-" },
    { text: "ティッシュ", romaji: "thissyu" },
    { text: "シャンプー", romaji: "syanpu-" },
    { text: "リンス", romaji: "rinsu" }
  ],

  // 3. 現象系・ことわざ・専門用語
  phenomenonAndProverbs: [
    { text: "ハイドロプレーニング現象", romaji: "haidoropure-ningugensyou" },
    { text: "ゲリラ豪雨", romaji: "geriragouu" },
    { text: "ミラージュ現象", romaji: "mira-zyugensyou" },
    { text: "フェーン現象", romaji: "fe-ngensyou" },
    { text: "ドップラー効果", romaji: "doppura-kouka" },
    { text: "箸でカレーを食べる", romaji: "hasidekare-wotaberu" },
    { text: "健康的な生活", romaji: "kenkoutekinaseikatu" },
    { text: "因果応報", romaji: "ingaouhou" },
    { text: "自業自得", romaji: "zigouzitoku" },
    { text: "一石二鳥", romaji: "issekinityou" },
    { text: "レンセラー工科大学", romaji: "rensera-koukadaigaku" },
    { text: "ミシシッピ大学", romaji: "misisippidaigaku" },
    { text: "十人十色", romaji: "zyuunintoiro" },
    { text: "馬の耳に念仏", romaji: "umanomimininenbutu" },
    { text: "猫に小判", romaji: "nekonikobann" },
    { text: "猿も木から落ちる", romaji: "sarumokikaraotiru" },
    { text: "本当ですか？", romaji: "hontoudesuka?" },
    { text: "本当に信じられない", romaji: "hontounisinzirarenai" },
    { text: "どうしてこうなった？", romaji: "dousitekounatta?" },
    { text: "これでいいのだ", romaji: "koredeiinoda" },
    { text: "嘘つきは泥棒の始まり", romaji: "usotukihadorobounohazimari" },
    { text: "終わり良ければ全て良し", romaji: "owariyokerebasubeteyosi" },
    { text: "急がば回れ", romaji: "isogabamaware" }
  ],

  // 4. 後半・文章系（日常のセリフ、自然な文）
  sentences: [
    { text: "歯が抜けました", romaji: "haganukemasita" },
    { text: "どこかで会いましたよね？", romaji: "dokokadeaimasitayone?" },
    { text: "いいニュースと悪いニュースがあります", romaji: "iinyu-sutowaruinyu-sugaarimasu" },
    { text: "隠れても無駄だ!", romaji: "kakuretemomudada!" },
    { text: "昨日の晩御飯はカレーでした", romaji: "kinounobangohanhakare-desita" },
    { text: "明日の天気は晴れのち雨らしい", romaji: "asitanotenkihaharenotiamerasii" },
    { text: "電車の時間を間違えた", romaji: "densyanozikanwomatigaeta" },
    { text: "お店の新作レシピ", romaji: "omisenosinsakuresipi" },
    { text: "財布を家に忘れてしまった", romaji: "saihuwoieniwasuretesimatta" },
    { text: "なんとなく本屋をぶらぶらする", romaji: "nantonakuhonyawoburaburasuru" },
    { text: "まさかこんなところで出会うとは", romaji: "masakakonnatokorodedeautoha" },
    { text: "準備はいいですか？", romaji: "zyunbihaiidesuka?" },
    { text: "ボタンを押し間違えて焦った", romaji: "botanwoosimatigaeteasetta" },
    { text: "静かな夜に虫の声が聞こえる", romaji: "sizukanayorunimusinokoegakikoeru" },
    { text: "新しいゲームを買ったんだ", romaji: "atarasiige-muwokattanda" },
    { text: "お腹が空きすぎて動けない", romaji: "onakagasukisugiteugokenai" },
    { text: "それって本当ですか？", romaji: "sorettehontoudesuka?" },
    { text: "たまにはのんびり散歩しよう", romaji: "tamanihanonbirisanposiyou" },
    { text: "驚きのあまり声が出なかった", romaji: "odorokinoamarikoegadenakatta" }
  ],

  // 重複を防ぐためのプレイ用管理プール
  _usedWords: new Set(),

  /**
   * ゲーム開始時（またはリセット時）に呼び出すことで使用済み履歴をリセットする
   */
  resetGame() {
    this._usedWords.clear();
  },

  /**
   * メーターの進行度（0.0 〜 1.0）に応じて、まだ出題されていない単語をランダムに取得する
   * @param {number} progress - 0.0（開始時）から 1.0（クリア間際）までの数値
   * @returns {Object} タイピング用のオブジェクト（text と romaji を持つ）
   */
  getNextWord(progress) {
    let pool = [];

    if (progress < 0.4) {
      pool = this.earlyWords;
    } else if (progress >= 0.4 && progress < 0.7) {
      pool = [...this.midWords, ...this.phenomenonAndProverbs];
    } else {
      pool = [...this.sentences, ...this.phenomenonAndProverbs];
    }

    // まだ今回のプレイで使っていない単語をフィルタリング
    let availablePool = pool.filter(item => !this._usedWords.has(item.text));

    // もし該当プールの単語をすべて使い切ってしまった場合は、一度履歴をリセットしてループさせる
    if (availablePool.length === 0) {
      pool.forEach(item => this._usedWords.delete(item.text));
      availablePool = pool;
    }

    // 残っている中からランダムに1つ選ぶ
    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const selectedWord = availablePool[randomIndex];

    // 使用済みとして記録
    this._usedWords.add(selectedWord.text);

    return selectedWord;
  }
};