const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
const port = process.env.PORT || 3000;

const bigquery = new BigQuery({
  projectId: process.env.BQ_PROJECT_ID,
  credentials: JSON.parse(process.env.BQ_KEY_JSON)
});

app.get('/', async (req, res) => {
  try {
    const [rows] = await bigquery.query(`SELECT "Hello BigQuery!" AS message`);
    res.send(rows[0].message);
  } catch (err) {
    console.error(err);
    res.status(500).send('BigQuery接続エラー！');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
