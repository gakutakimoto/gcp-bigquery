// =========================
// モジュール読み込み & 基本設定
// =========================
require('dotenv').config();
const express = require('express');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
const port = process.env.PORT || 3000;

// =========================
// ログ出力
// =========================
// console.log("🔑 Loaded credentials:", process.env.BQ_KEY_JSON);

// =========================
// 静的ファイル軸的ファイルの提供
// =========================
app.use(express.static(path.join(__dirname, 'public')));

// =========================
// BigQuery クライアント初期化
// =========================
const bigquery = new BigQuery({
  projectId: process.env.BQ_PROJECT_ID,
  credentials: JSON.parse(process.env.BQ_KEY_JSON),
});

// =========================
// API: 全データ取得
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
    swing_cluster_unified
  FROM \`m-tracer-data-dashboard.m_tracer_swing_data.m-tracer-dataset\`
  WHERE swing_cluster_unified IS NOT NULL
  LIMIT 5000
`;


    const [rows] = await bigquery.query(query);
    res.json(rows);
  } catch (err) {
    console.error('BigQuery接続エラー:', err);
    res.status(500).json({ error: 'BigQuery接続エラー' });
  }
});

// ============================
// APIエンドポイント：タイトルカードの中央値を取得
// ============================
app.get('/api/median', async (req, res) => {
  try {
    const query = `
      SELECT
        c.median_estimateCarry,
        h.median_impactHeadSpeed,
        f.median_impactFaceAngle
      FROM \`m-tracer-data-dashboard.m_tracer_swing_data.estimateCarry_median_view\` AS c
      JOIN \`m-tracer-data-dashboard.m_tracer_swing_data.impactHeadSpeed_median_view\` AS h
      ON TRUE
      JOIN \`m-tracer-data-dashboard.m_tracer_swing_data.impactFaceAngle_median_view\` AS f
      ON TRUE
    `;
    const [rows] = await bigquery.query(query);

 if (rows.length > 0) {
  res.json(rows[0]); // ✅ 3つのカラム全部返すように！
} else {
      res.status(404).json({ error: 'データが見つかりません' });
    }
  } catch (err) {
    console.error('BigQuery接続エラー（/api/median）:', err);
    res.status(500).json({ error: 'BigQuery接続エラー' });
  }
});

// ============================
// ５つの指標の中央値を取得
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
    res.json(rows[0]); // ✅1行だけ返す！
  } catch (err) {
    console.error('🔥 /api/metrics エラー:', err);
    res.status(500).json({ error: 'BigQueryエラー' });
  }
});


// =========================
// ルート: HTML表示
// =========================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// =========================
// サーバー起動
// =========================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





