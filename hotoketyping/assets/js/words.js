/* ==========================================
   仏タイピング - 単語・文章データ & 生成システム (words.js) - 完全版
   ========================================== */

const WordSystem = {
  // 1. 序盤用：2〜4文字の短い単語・日常語・動物・自然
  earlyWords: [
    { text: "象", kana: "ぞう", romaji: "zou" },
    { text: "サル", kana: "さる", romaji: "saru" },
    { text: "犬", kana: "いぬ", romaji: "inu" },
    { text: "猫", kana: "ねこ", romaji: "neko" },
    { text: "鳥", kana: "とり", romaji: "tori" },
    { text: "虫", kana: "むし", romaji: "musi" },
    { text: "魚", kana: "さかな", romaji: "sakana" },
    { text: "牛", kana: "うし", romaji: "usi" },
    { text: "馬", kana: "うま", romaji: "uma" },
    { text: "羊", kana: "ひつじ", romaji: "hituzi" },
    { text: "鹿", kana: "しか", romaji: "sika" },
    { text: "熊", kana: "くま", romaji: "kuma" },
    { text: "狐", kana: "きつね", romaji: "kitune" },
    { text: "狸", kana: "たぬき", romaji: "tanuki" },
    { text: "蛇", kana: "へび", romaji: "hebi" },
    { text: "蛙", kana: "かえる", romaji: "kaeru" },
    { text: "蟹", kana: "かに", romaji: "kani" },
    { text: "貝", kana: "かい", romaji: "kai" },
    { text: "朝", kana: "あさ", romaji: "asa" },
    { text: "夜", kana: "よる", romaji: "yoru" },
    { text: "海", kana: "うみ", romaji: "umi" },
    { text: "山", kana: "やま", romaji: "yama" },
    { text: "川", kana: "かわ", romaji: "kawa" },
    { text: "空", kana: "そら", romaji: "sora" },
    { text: "鮭", kana: "さけ", romaji: "sake" },
    { text: "雪", kana: "ゆき", romaji: "yuki" },
    { text: "風", kana: "かぜ", romaji: "kaze" },
    { text: "月", kana: "つき", romaji: "tuki" },
    { text: "学校", kana: "がっこう", romaji: "gakkou" },
    { text: "星", kana: "ほし", romaji: "hosi" },
    { text: "花", kana: "はな", romaji: "hana" },
    { text: "草", kana: "くさ", romaji: "kusa" },
    { text: "木", kana: "き", romaji: "ki" },
    { text: "森", kana: "もり", romaji: "mori" },
    { text: "林", kana: "はやし", romaji: "hayasi" },
    { text: "池", kana: "いけ", romaji: "ike" },
    { text: "サンマ", kana: "さんま", romaji: "sanma" },
    { text: "ファイル", kana: "ふぁいる", romaji: "fairu" },
    { text: "本", kana: "ほん", romaji: "honn" },
    { text: "机", kana: "つくえ", romaji: "tukue" },
    { text: "椅子", kana: "いす", romaji: "isu" },
    { text: "窓", kana: "まど", romaji: "mado" },
    { text: "ドア", kana: "どあ", romaji: "doa" },
    { text: "靴", kana: "くつ", romaji: "kutu" },
    { text: "服", kana: "ふく", romaji: "huku" },
    { text: "鍵", kana: "かぎ", romaji: "kagi" },
    { text: "時計", kana: "とけい", romaji: "tokei" },
    { text: "鏡", kana: "かがみ", romaji: "kagami" },
    { text: "箸", kana: "はし", romaji: "hasi" },
    { text: "鉛筆", kana: "えんぴつ", romaji: "enpitu" },
    { text: "ペン", kana: "ぺん", romaji: "penn" },
    { text: "ノート", kana: "のーと", romaji: "no-to" },
    { text: "紙", kana: "かみ", romaji: "kami" },
    { text: "ハサミ", kana: "はさみ", romaji: "hasami" },
    { text: "箱", kana: "はこ", romaji: "hako" },
    { text: "袋", kana: "ふくろ", romaji: "hukuro" },
    { text: "傘", kana: "かさ", romaji: "kasa" },
    { text: "旗", kana: "はた", romaji: "hata" },
    { text: "鈴", kana: "すず", romaji: "suzu" },
    { text: "球", kana: "たま", romaji: "tama" },
    { text: "縄", kana: "なわ", romaji: "nawa" },
    { text: "網", kana: "あみ", romaji: "ami" },
    { text: "杖", kana: "つえ", romaji: "tue" },
    { text: "盾", kana: "たて", romaji: "tate" },
    { text: "剣", kana: "けん", romaji: "kenn" },
    { text: "今日", kana: "きょう", romaji: "kyou" },
    { text: "アサリ", kana: "あさり", romaji: "asari" },
    { text: "鉄球", kana: "てっきゅう", romaji: "tekkyuu" },
    { text: "作家", kana: "さっか", romaji: "sakka" },
    { text: "作曲家", kana: "さっきょくか", romaji: "sakkyokuka" },
    { text: "漫画家", kana: "まんがか", romaji: "mangaka" },
    { text: "パニック", kana: "ぱにっく", romaji: "panikku" },
    { text: "サーモン", kana: "さーもん", romaji: "sa-monn" },
    { text: "マグロ", kana: "まぐろ", romaji: "maguro" },
    { text: "イカ", kana: "いか", romaji: "ika" },
    { text: "トラ", kana: "とら", romaji: "tora" },
    { text: "パンダ", kana: "ぱんだ", romaji: "panda" },
    { text: "消しゴム", kana: "けしごむ", romaji: "kesigomu" },
    { text: "カバン", kana: "かばん", romaji: "kabann" },
    { text: "歯ブラシ", kana: "はぶらし", romaji: "haburasi" },
    { text: "定規", kana: "じょうぎ", romaji: "zyougi" },
    { text: "スマホ", kana: "すまほ", romaji: "sumaho" },
    { text: "絵の具", kana: "えのぐ", romaji: "enogu" },
    { text: "切手", kana: "きって", romaji: "kitte" },
    { text: "拍手", kana: "はくしゅ", romaji: "hakusyu" },
    { text: "祭り", kana: "まつり", romaji: "maturi" },
    { text: "病気", kana: "びょうき", romaji: "byouki" },
    { text: "温泉", kana: "おんせん", romaji: "onsenn" },
    { text: "テキスト", kana: "てきすと", romaji: "tekisuto" },
    { text: "白菜", kana: "はくさい", romaji: "hakusai" },
    { text: "トマト", kana: "とまと", romaji: "tomato" },
    { text: "レタス", kana: "れたす", romaji: "retasu" },
    { text: "パズル", kana: "ぱずる", romaji: "pazuru" },
    { text: "ゲーム", kana: "げーむ", romaji: "ge-mu" },
    { text: "会社", kana: "かいしゃ", romaji: "kaisya" },
    { text: "歩く", kana: "あるく", romaji: "aruku" },
    { text: "天井", kana: "てんじょう", romaji: "tenzyou" },
    { text: "お店", kana: "おみせ", romaji: "omise" },
    { text: "ポスト", kana: "ぽすと", romaji: "posuto" },
    { text: "薬", kana: "くすり", romaji: "kusuri" },
    { text: "ローマ字", kana: "ろーまじ", romaji: "ro-mazi" },
    { text: "戦国", kana: "せんごく", romaji: "sengoku" },
    { text: "布団", kana: "ふとん", romaji: "hutonn" },
    { text: "毛布", kana: "もうふ", romaji: "mouhu" },
    { text: "戦場", kana: "せんじょう", romaji: "senzyou" },
    { text: "人影", kana: "ひとかげ", romaji: "hitokage" },
    { text: "カーテン", kana: "かーてん", romaji: "ka-tenn" },
    { text: "ミス", kana: "みす", romaji: "misu" },
    { text: "波", kana: "なみ", romaji: "nami" },
    { text: "電車", kana: "でんしゃ", romaji: "densya" },
    { text: "飴", kana: "あめ", romaji: "ame" },
    { text: "道路", kana: "どうろ", romaji: "douro" },
    { text: "移動", kana: "いどう", romaji: "idou" },
    { text: "ミルク", kana: "みるく", romaji: "miruku" },
    { text: "玄関", kana: "げんかん", romaji: "genkann" },
    { text: "日本", kana: "にほん", romaji: "nihonn" },
    { text: "広場", kana: "ひろば", romaji: "hiroba" },
    { text: "笑み", kana: "えみ", romaji: "emi" },
    { text: "芸人", kana: "げいにん", romaji: "geininn" }
  ],

  // 2. 中盤用：4〜7文字の単語・日常語・生き物・モノ
  midWords: [
    { text: "水しぶき", kana: "みずしぶき", romaji: "mizusibuki" },
    { text: "オカリナ", kana: "おかりな", romaji: "okarina" },
    { text: "トランペット", kana: "とらんぺっと", romaji: "toranpetto" },
    { text: "ハムスター", kana: "はむすたー", romaji: "hamusuta-" },
    { text: "引っ越し", kana: "ひっこし", romaji: "hikkosi" },
    { text: "ハリネズミ", kana: "はりねずみ", romaji: "harinezumi" },
    { text: "コンセント", kana: "こんせんと", romaji: "konsento" },
    { text: "冷蔵庫", kana: "れいぞうこ", romaji: "reizouko" },
    { text: "洗濯機", kana: "せんたくき", romaji: "sentakuki" },
    { text: "電子レンジ", kana: "でんしれんじ", romaji: "densirenzi" },
    { text: "スマートフォン", kana: "すまーとふぉん", romaji: "suma-tofonn" },
    { text: "イヤホン", kana: "いやほん", romaji: "iyahonn" },
    { text: "プログラミング", kana: "ぷろぐらみんぐ", romaji: "puroguramingu" },
    { text: "キーボード", kana: "きーぼーど", romaji: "ki-bo-do" },
    { text: "ディスプレイ", kana: "でぃすぷれい", romaji: "dhisupurei" },
    { text: "ネットワーク", kana: "ねっとわーく", romaji: "nettowa-ku" },
    { text: "データベース", kana: "でーたべーす", romaji: "de-tabe-su" },
    { text: "セキュリティ", kana: "せきゅりてぃ", romaji: "sekyurithi" },
    { text: "ひまわり", kana: "ひまわり", romaji: "himawari" },
    { text: "チューリップ", kana: "ちゅーりっぷ", romaji: "tyu-rippu" },
    { text: "タンポポ", kana: "たんぽぽ", romaji: "tanpopo" },
    { text: "アスパラガス", kana: "あすぱらがす", romaji: "asuparagasu" },
    { text: "ブロッコリー", kana: "ぶろっこりー", romaji: "burokkori-" },
    { text: "ハンバーグ", kana: "はんばーぐ", romaji: "hanba-gu" },
    { text: "フライパン", kana: "ふらいぱん", romaji: "huraipann" },
    { text: "スプーン", kana: "すぷーん", romaji: "supu-nn" },
    { text: "フォーク", kana: "ふぉーく", romaji: "fo-ku" },
    { text: "ストロー", kana: "すとろー", romaji: "sutoro-" },
    { text: "ティッシュ", kana: "てぃっしゅ", romaji: "thissyu" },
    { text: "シャンプー", kana: "しゃんぷー", romaji: "syanpu-" },
    { text: "リンス", kana: "りんす", romaji: "rinsu" }
  ],

  // 3. 現象系・ことわざ・専門用語
  phenomenonAndProverbs: [
    { text: "ハイドロプレーニング現象", kana: "はいどろぷれーにんぐげんしょう", romaji: "haidoropure-ningugensyou" },
    { text: "ゲリラ豪雨", kana: "げりらごうう", romaji: "geriragouu" },
    { text: "ミラージュ現象", kana: "みらーじゅげんしょう", romaji: "mira-zyugensyou" },
    { text: "フェーン現象", kana: "ふぇーんげんしょう", romaji: "fe-ngensyou" },
    { text: "ドップラー効果", kana: "どっぷらーこうか", romaji: "doppura-kouka" },
    { text: "箸でカレーを食べる", kana: "はしでかれーをたべる", romaji: "hasidekare-wotaberu" },
    { text: "健康的な生活", kana: "けんこうてきなせいかつ", romaji: "kenkoutekinaseikatu" },
    { text: "因果応報", kana: "いんがおうほう", romaji: "ingaouhou" },
    { text: "自業自得", kana: "じごうじとく", romaji: "zigouzitoku" },
    { text: "一石二鳥", kana: "いっせきにちょう", romaji: "issekinityou" },
    { text: "レンセラー工科大学", kana: "れんせらーこうかだいがく", romaji: "rensera-koukadaigaku" },
    { text: "ミシシッピ大学", kana: "みししっぴだいがく", romaji: "misisippidaigaku" },
    { text: "十人十色", kana: "じゅうにんといろ", romaji: "zyuunintoiro" },
    { text: "馬の耳に念仏", kana: "うまのみみにねんぶつ", romaji: "umanomimininenbutu" },
    { text: "猫に小判", kana: "ねこにこばん", romaji: "nekonikobann" },
    { text: "猿も木から落ちる", kana: "さるもきからおちる", romaji: "sarumokikaraotiru" },
    { text: "本当ですか？", kana: "ほんとうですか？", romaji: "hontoudesuka?" },
    { text: "本当に信じられない", kana: "ほんとうにしんじられない", romaji: "hontounisinzirarenai" },
    { text: "どうしてこうなった？", kana: "どうしてこうなった？", romaji: "dousitekounatta?" },
    { text: "これでいいのだ", kana: "これでいいのだ", romaji: "koredeiinoda" },
    { text: "嘘つきは泥棒の始まり", kana: "うそつきはどろぼうのはじまり", romaji: "usotukihadorobounohazimari" },
    { text: "終わり良ければ全て良し", kana: "おわりよければすべてよし", romaji: "owariyokerebasubeteyosi" },
    { text: "急がば回れ", kana: "いそがばまわれ", romaji: "isogabamaware" }
  ],

  // 4. 後半・文章系（日常のセリフ、自然な文）
  sentences: [
    { text: "歯が抜けました", kana: "はがぬけました", romaji: "haganukemasita" },
    { text: "どこかで会いましたよね？", kana: "どこかで会いましたよね？".replace(/会いました/g, "あいました"), romaji: "dokokadeaimasitayone?" },
    { text: "いいニュースと悪いニュースがあります", kana: "いいにゅーすとわるいにゅーすがあります", romaji: "iinyu-sutowaruinyu-sugaarimasu" },
    { text: "隠れても無駄だ!", kana: "かくれてもむだだ!", romaji: "kakuretemomudada!" },
    { text: "昨日の晩御飯はカレーでした", kana: "きのうのばんごはんはかれーでした", romaji: "kinounobangohanhakare-desita" },
    { text: "明日の天気は晴れのち雨らしい", kana: "あしたのてんきははれのちあめらしい", romaji: "asitanotenkihaharenotiamerasii" },
    { text: "電車の時間を間違えた", kana: "でんしゃのじかんをまちがえた", romaji: "densyanozikanwomatigaeta" },
    { text: "お店の新作レシピ", kana: "おみせのしんさくれしぴ", romaji: "omisenosinsakuresipi" },
    { text: "アプリケーションエラーが発生しました", kana: "あぷりけーしょんえらーがはっせいしました", romaji: "apurike-syonera-gahasseisimasita" },
    { text: "なんとなく本屋をぶらぶらする", kana: "なんとなくほんやをぶらぶらする", romaji: "nantonakuhonyawoburaburasuru" },
    { text: "まさかこんなところで出会うとは", kana: "まさかこんなところでであうとは", romaji: "masakakonnatokorodedeautoha" },
    { text: "準備はいいですか？", kana: "じゅんびはいいですか？", romaji: "zyunbihaiidesuka?" },
    { text: "ボタンを押し間違えて焦った", kana: "ぼたんをおしまちがえてあせった", romaji: "botanwoosimatigaeteasetta" },
    { text: "屋上あるんだけど、焼いていかない？", kana: "おくじょうあるんだけど、やいていかない？", romaji: "okuzyouarundakedo,yaiteikanai?" },
    { text: "新しいゲームを買ったんだ", kana: "あたらしいげーむをかったんだ", romaji: "atarasiige-muwokattanda" },
    { text: "お腹が空きすぎて動けない", kana: "おなかがすきすぎてうごけない", romaji: "onakagasukisugiteugokenai" },
    { text: "それって本当ですか？", kana: "それってほんとうですか？", romaji: "sorettehontoudesuka?" },
    { text: "たまにはのんびり散歩しよう", kana: "たまにはのんびりさんぽしよう", romaji: "tamanihanonbirisanposiyou" },
    { text: "高級お寿司レストラン", kana: "こうきゅうおすしれすとらん", romaji: "koukyuuosusiresutorann" }
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
   * @returns {Object} タイピング用のオブジェクト（text, kana, romaji を持つ）
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