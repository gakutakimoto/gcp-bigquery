require('dotenv').config();
const express = require('express');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');
const app = express();
const port = process.env.PORT || 3000;

// 静的ファイルを提供する
app.use(express.static(path.join(__dirname, 'public')));

// BigQueryのクライアントを初期化
const bigquery = new BigQuery({
  projectId: process.env.BQ_PROJECT_ID,
  credentials: JSON.parse(process.env.BQ_KEY_JSON),
});

// ルートアクセス時にHTMLを返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// APIエンドポイント：データの取得
app.get('/api/data', async (req, res) => {
  try {
    const query = `
      SELECT
        impactHeadSpeed,
        impactFaceAngle,
        estimateCarry,
        impactAttackAngle
      FROM
        \`m-tracer-data-dashboard.m_tracer_swing_data.m-tracer-dataset\`
      LIMIT 5
    `;
    
    const [rows] = await bigquery.query(query);
    res.json(rows);
  } catch (err) {
    console.error('BigQuery接続エラー:', err);
    res.status(500).json({ error: 'BigQuery接続エラー' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});