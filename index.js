// =========================
// モジュール読み込み & 基本設定
// =========================
require('dotenv').config();
const express = require('express');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();
const port = process.env.PORT || 3000;

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
app.get('/api/random-swing', async (req, res) => {
  console.log('API /api/random-swing が呼び出されました');
  try {
    // ★★★ BigQueryでランダムに1行取得するクエリ ★★★
    const query = `
      SELECT
          -- ↓↓↓↓↓↓ 表示に必要なカラム名をここに正確に列挙してください ↓↓↓↓↓↓
          impactClubPath,
          impactHandFirst,  -- テーブルにこのカラム名が存在するか確認
          impactGripSpeed,
          downSwingShaftRotationMax, -- テーブルにこのカラム名が存在するか確認
          halfwaydownFaceAngleToVertical, -- テーブルにこのカラム名が存在するか確認
          halfwaybackFaceAngleToVertical, -- テーブルにこのカラム名が存在するか確認
          topFaceAngleToHorizontal, -- テーブルにこのカラム名が存在するか確認
          -- 必要に応じて他の分析用カラムも追加
                downSwingShaftRotationMin,  -- これを追加
      addressHandFirst,           -- これを追加
      addressLieAngle,            -- これを追加
          impactAttackAngle,
    estimateCarry, 
    impactHeadSpeed,
          impactFaceAngle,
          impactLoftAngle, -- 例: 追加
          maxGripSpeed     -- 例: 追加
          -- ↑↑↑↑↑↑ 表示に必要なカラム名をここに正確に列挙してください ↑↑↑↑↑↑
      FROM
          \`m-tracer-data-dashboard.m_tracer_swing_data.m-tracer-dataset\` -- テーブル名の確認
      WHERE
          -- ランダムサンプリング条件 (調整可能)
          RAND() < 0.001 -- 全体の0.1%からランダムに選ぶ
          -- AND impactClubPath IS NOT NULL -- データ品質のための条件 (必要なら)
      ORDER BY
          RAND()
      LIMIT 1
    `;

    console.log('実行するクエリ:', query);

    const options = { query: query };
    const [rows] = await bigquery.query(options);

    if (rows.length > 0) {
      console.log('ランダムなスイングデータを取得:', rows[0]);
      res.json(rows[0]); // 取得したデータを返す
    } else {
      console.warn('/api/random-swing: 条件に合うデータが見つかりませんでした。サンプリング条件を見直してください。');
      // 何度かリトライするか、エラーを返すなどの考慮も可能
      res.status(404).json({ error: 'ランダムなスイングデータが見つかりませんでした。' });
    }
  } catch (err) {
    console.error('🔥 /api/random-swing エラー:', err);
    // エラーオブジェクトの内容もログ出力するとデバッグに役立つ
    console.error('エラー詳細:', err.message, err.stack);
    res.status(500).json({ error: 'BigQuery接続またはクエリエラーが発生しました。' });
  }
});
// ▲▲▲ ここまで新しいAPIエンドポイントを追加 ▲▲▲


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