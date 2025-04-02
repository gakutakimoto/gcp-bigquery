const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
const port = process.env.PORT || 3000;

// BigQueryのクライアントを初期化
const bigquery = new BigQuery({
  projectId: process.env.BQ_PROJECT_ID,
  credentials: JSON.parse(process.env.BQ_KEY_JSON),
});

// ルートアクセス時にデータを取得
app.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        impactHeadSpeed,
        impactFaceAngle,
        estimateCarry
      FROM
        \`m-tracer-data-dashboard.m_tracer_swing_data.m-tracer-dataset\`
      LIMIT 5
    `;

    const [rows] = await bigquery.query(query);
    res.json(rows); // JSON形式で結果を返す
  } catch (err) {
    console.error('BigQuery接続エラー:', err);
    res.status(500).send('BigQuery接続エラー！');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
