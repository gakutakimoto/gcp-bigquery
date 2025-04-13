// =========================
// モジュール読み込み & 基本設定
// =========================
require('dotenv').config();
const express = require('express');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');
const OpenAI = require('openai'); // ★★★ OpenAI モジュールを読み込み ★★★
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();
const port = process.env.PORT || 3000;

// =========================
// JSONボディパーサーの有効化 (APIにテキストを送るため) ★★★ 追加 ★★★
// =========================
app.use(express.json()); // POSTリクエストのbodyをJSONとして解析


// =========================
// ログ出力
// =========================
// console.log("🔑 Loaded credentials:", process.env.BQ_KEY_JSON);

// =========================
// 静的ファイルの提供
// =========================
app.use(express.static(path.join(__dirname, 'public')));

// LiveReloadサーバーを作成
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public')); // publicフォルダを監視

// LiveReloadをExpressアプリに接続
app.use(connectLivereload());

// サーバーが起動したら、クライアントに変更を通知する
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100); // 少し待ってからリフレッシュ
});

// =========================
// BigQuery クライアント初期化
// =========================
const bigquery = new BigQuery({
  projectId: process.env.BQ_PROJECT_ID,
  credentials: JSON.parse(process.env.BQ_KEY_JSON), // 環境変数からキーを読み込む
});

// =========================
// OpenAI クライアント初期化 ★★★ 新規追加 ★★★
// =========================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 環境変数からAPIキーを読み込む
});


// =========================
// API: 全データ取得 (既存: テーブル用など)
// =========================
app.get('/api/data', async (req, res) => {
  try {
    const query = `
      SELECT
        impactHeadSpeed,
        impactFaceAngle,
        estimateCarry,
        impactAttackAngle,
        impactGripSpeed,
        impactClubPath,
        estimateCarry, 
        impactHeadSpeed,
        swing_cluster_unified
      FROM \`m-tracer-data-dashboard.m_tracer_swing_data.m-tracer-dataset\`
      WHERE swing_cluster_unified IS NOT NULL
      LIMIT 5000
    `;
    const [rows] = await bigquery.query(query);
    res.json(rows);
  } catch (err) {
    console.error('BigQuery接続エラー (/api/data):', err);
    res.status(500).json({ error: 'BigQuery接続エラー' });
  }
});

// ============================
// API: タイトルカードの中央値を取得 (既存)
// ============================
app.get('/api/median', async (req, res) => {
  try {
    const query = `
      SELECT
        c.median_estimateCarry,
        h.median_impactHeadSpeed,
        f.median_impactFaceAngle
      FROM \`m-tracer-data-dashboard.m_tracer_swing_data.estimateCarry_median_view\` AS c
      JOIN \`m-tracer-data-dashboard.m_tracer_swing_data.impactHeadSpeed_median_view\` AS h ON TRUE
      JOIN \`m-tracer-data-dashboard.m_tracer_swing_data.impactFaceAngle_median_view\` AS f ON TRUE
    `;
    const [rows] = await bigquery.query(query);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: '中央値データが見つかりません' });
    }
  } catch (err) {
    console.error('BigQuery接続エラー（/api/median）:', err);
    res.status(500).json({ error: 'BigQuery接続エラー' });
  }
});

// ============================
// API: ５つの指標の中央値を取得 (既存)
// ============================
app.get('/api/metrics', async (req, res) => {
  try {
    const query = `
      SELECT
        a.median_impactClubPath,
        b.median_impactLoftAngle,
        c.median_maxGripSpeed,
        d.median_impactLieAngle,
        e.median_impactAttackAngle
      FROM \`m-tracer-data-dashboard.m_tracer_swing_data.median_impactClubPath\` AS a
      JOIN \`m-tracer-data-dashboard.m_tracer_swing_data.median_impactLoftAngle\` AS b ON TRUE
      JOIN \`m-tracer-data-dashboard.m_tracer_swing_data.median_maxGripSpeed\` AS c ON TRUE
      JOIN \`m-tracer-data-dashboard.m_tracer_swing_data.median_impactLieAngle\` AS d ON TRUE
      JOIN \`m-tracer-data-dashboard.m_tracer_swing_data.median_impactAttackAngle\` AS e ON TRUE
    `;
    const [rows] = await bigquery.query(query);
     if (rows.length > 0) {
        res.json(rows[0]);
     } else {
        res.status(404).json({ error: '詳細指標データが見つかりません' });
     }
  } catch (err) {
    console.error('🔥 /api/metrics エラー:', err);
    res.status(500).json({ error: 'BigQueryエラー' });
  }
});


// ▼▼▼ ここから新しいAPIエンドポイントを追加 ▼▼▼
// ============================
// API: BigQueryからランダムなスイングデータを1件取得
// ============================
// index.js

// ▼▼▼ /api/random-swing の処理を修正 ▼▼▼
app.get('/api/random-swing', async (req, res) => {
  console.log('API /api/random-swing が呼び出されました (クラスタ指定ランダム版)');
  try {
    // 1. ターゲットとなるクラスタIDをランダムに選択 (0から9の整数)
    const targetClusterId = Math.floor(Math.random() * 10); // 0から9までのランダムな整数を生成
    console.log(`ターゲットクラスタID: ${targetClusterId}`);

    // 2. 指定されたクラスタIDを持つデータの中からランダムに1件取得するクエリ
    const query = `
      SELECT
          -- 必要なカラム名を列挙 (現状維持でOKのはず)
          impactClubPath,
          impactHandFirst,
          impactGripSpeed,
          downSwingShaftRotationMax,
          halfwaydownFaceAngleToVertical,
          halfwaybackFaceAngleToVertical,
          topFaceAngleToHorizontal,
          downSwingShaftRotationMin,
          addressHandFirst,
          addressLieAngle,
          impactAttackAngle,
          estimateCarry,
          impactHeadSpeed,
          impactFaceAngle,
          impactLoftAngle,
          maxGripSpeed,
          impactRelativeFaceAngle, -- テーブル表示用に以前追加したカラムも念のため含める
          swing_cluster_unified -- どのクラスタが選ばれたか確認用に含めても良い
      FROM
          \`m-tracer-data-dashboard.m_tracer_swing_data.m-tracer-dataset\` -- テーブル名を確認
      WHERE
          swing_cluster_unified = @clusterId -- ★★★ ランダムに選んだクラスタIDで絞り込む ★★★
          -- 他に必要な WHERE 条件があればここに追加 (例: AND impactHeadSpeed IS NOT NULL)
      ORDER BY
          RAND() -- 選ばれたクラスタ内でランダムに並び替え
      LIMIT 1    -- その中から1件だけ取得
    `;

    console.log('実行するクエリ:', query);
    console.log('パラメータ:', { clusterId: targetClusterId });

    // クエリオプションにパラメータを設定 (SQLインジェクション対策として推奨)
    const options = {
      query: query,
      params: { clusterId: targetClusterId } // クエリ内の @clusterId に値を設定
    };

    // クエリ実行
    const [rows] = await bigquery.query(options);

    // 3. 結果の処理
    if (rows.length > 0) {
      console.log(`クラスタ ${targetClusterId} からランダムなスイングデータを取得:`, rows[0]);
      res.json(rows[0]); // 取得したデータを返す
    } else {
      // もし指定したクラスタIDのデータが0件だった場合の処理
      console.warn(`/api/random-swing: クラスタ ${targetClusterId} にデータが見つかりませんでした。`);
      // ここではエラーを返すことにします。
      // 必要であれば、別のクラスタIDでリトライするなどの処理を追加することも可能です。
      res.status(404).json({ error: `クラスタ ${targetClusterId} に該当するスイングデータが見つかりませんでした。` });
    }
  } catch (err) {
    console.error('🔥 /api/random-swing エラー:', err);
    console.error('エラー詳細:', err.message, err.stack);
    res.status(500).json({ error: 'BigQuery接続またはクエリエラーが発生しました。' });
  }
});
// ▲▲▲ /api/random-swing の修正ここまで ▲▲▲


// ▼▼▼ OpenAI TTS APIを呼び出す新しいエンドポイント ▼▼▼
// ============================
// API: テキストから音声を生成
// ============================
app.post('/api/generate-speech', async (req, res) => {
  console.log('API /api/generate-speech が呼び出されました');
  const textToSpeak = req.body.text; // フロントエンドから送られてくるテキストを取得
  const voiceOption = req.body.voice || 'nova'; // 声のオプション (デフォルト: alloy)

  if (!textToSpeak) {
    console.error('音声生成エラー: テキストが指定されていません。');
    return res.status(400).json({ error: 'テキストを指定してください。' });
  }
  if (textToSpeak.length > 4096) { // OpenAIの制限確認
    console.error('音声生成エラー: テキストが長すぎます。');
    return res.status(400).json({ error: 'テキストが長すぎます (4096文字以内)。' });
  }


  console.log(`受け取ったテキスト: "${textToSpeak}"`);
  console.log(`使用する声: ${voiceOption}`);

  try {
    console.log('OpenAI TTS API 呼び出し開始...');
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",         // または "tts-1-hd"
      voice: voiceOption,     // 声の種類 (alloy, echo, fable, onyx, nova, shimmer)
      input: textToSpeak,
      response_format: "opus", // レスポンス形式 (mp3, opus, aac, flac)
      // speed: 1.0,          // 再生速度 (0.25から4.0、任意)
    });
    console.log('OpenAI TTS API 呼び出し成功');

    // ★★★ レスポンスとして音声データをクライアントに送信 ★★★
    // Content-Type を audio/mpeg に設定
    res.setHeader('Content-Type', 'audio/mpeg');
    // ReadableStream をパイプして送信
    mp3.body.pipe(res);

    // ストリームが終了したらログを出す (デバッグ用)
    mp3.body.on('end', () => {
      console.log('音声データの送信完了');
    });
    // エラーハンドリング
    mp3.body.on('error', (err) => {
        console.error('音声データの送信中にエラー:', err);
        // エラーが発生した場合、クライアントには既にヘッダーが送信されている可能性があるため、
        // res.status().json() でのエラー応答は難しい。接続を切断するなどで対応。
        res.end(); // 接続を閉じる
    });


  } catch (error) {
    console.error('🔥 OpenAI API エラー:', error);
    // エラーオブジェクトの内容に応じて、より具体的なエラーメッセージを返す
    let statusCode = 500;
    let errorMessage = '音声の生成中にエラーが発生しました。';
    if (error.response) {
        // OpenAIからのエラーレスポンスがある場合
        statusCode = error.response.status;
        errorMessage = error.response.data?.error?.message || errorMessage;
        console.error(`エラー詳細 (Status ${statusCode}):`, error.response.data);
    } else if (error.request) {
        // リクエストは送られたがレスポンスがない場合
        errorMessage = 'OpenAI APIからの応答がありませんでした。';
        console.error('リクエストエラー:', error.request);
    } else {
        // リクエスト設定時のエラーなど
        console.error('設定エラー:', error.message);
    }
    // クライアントには汎用的なエラーを返す (ステータスコードは状況に応じて設定)
    if (!res.headersSent) { // ヘッダーがまだ送信されていなければエラー応答を返す
         res.status(statusCode).json({ error: errorMessage });
    } else {
        console.log("ヘッダー送信済みのため、エラーJSONは返送しません。");
    }
  }
});
// ▲▲▲ 新しいAPIエンドポイントここまで ▲▲▲




// =========================
// ルート: HTML表示 (既存)
// =========================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// =========================
// サーバー起動 (既存)
// =========================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);


// ▼▼▼ 閾値データを取得するAPIを追加 ▼▼▼
// ============================
// API: クラスタ判定の閾値データを取得
// ============================
app.get('/api/thresholds', async (req, res) => {
  console.log('API /api/thresholds が呼び出されました');
  try {
    const query = `
      SELECT
          swing_cluster,
          feature,
          min,
          max
      FROM
          \`m-tracer-data-dashboard.m_tracer_swing_data.cluster_threshold\`
      ORDER BY
          swing_cluster, feature -- 念のためソート
    `;
    console.log('実行するクエリ (thresholds):', query);
    const options = { query: query };
    const [rows] = await bigquery.query(options);

    console.log(`閾値データを ${rows.length} 件取得しました`);
    res.json(rows); // テーブルの全行をJSON配列で返す

  } catch (err) {
    console.error('🔥 /api/thresholds エラー:', err);
    res.status(500).json({ error: '閾値データの取得中にエラーが発生しました。' });
  }
});
// ▲▲▲ 閾値データを取得するAPIを追加 ▲▲▲




  
});