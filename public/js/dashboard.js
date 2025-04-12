// =========================
// グローバル変数と初期データ
// =========================
let allSwingData = [];
let currentPage = 1;
const rowsPerPage = 8;
let metricsDataLoaded = false;
let thresholdData = [];
let clusterAnalysisData = {};
let currentRandomSwingData = null;
let successMediansData = {};
let adviceData = {};

// ▼▼▼ swingTypeData の定義はここに1回だけ ▼▼▼
const swingTypeData = [
  { id: 0, Club_Type: "ドライバー", Swing_Type_Name: "Out-In Power", Swing_Type_Name_JP: "アウトイン・パワーフォーム型", Overview: "パワフルなスイングで球の飛距離を重視。アウトインの軌道で力強く振り抜く。" },
  { id: 1, Club_Type: "ドライバー", Swing_Type_Name: "Out-In Compact", Swing_Type_Name_JP: "アウトイン・コンパクトフォーム型", Overview: "コンパクトなスイングでコントロール重視。アウトインの軌道で正確性を高める。" },
  { id: 2, Club_Type: "ドライバー", Swing_Type_Name: "Flexible Inside-Out", Swing_Type_Name_JP: "インアウト・フレキシブルフォーム型", Overview: "柔軟なフォームでスイング軌道に変化があり、状況対応力が高いスタイル。" },
  { id: 3, Club_Type: "ドライバー", Swing_Type_Name: "Inside-Out Power", Swing_Type_Name_JP: "インアウト・パワーフォーム型", Overview: "インアウトの軌道でパワーを活かしたスイング。ドローボールを打ちやすいスタイル。" },
  { id: 4, Club_Type: "ドライバー", Swing_Type_Name: "Inside-Out Standard", Swing_Type_Name_JP: "インアウト・スタンダードフォーム型", Overview: "バランスのとれたフォームでインアウト軌道を実現。安定感のあるスイング。" },
  { id: 5, Club_Type: "アイアン", Swing_Type_Name: "Out-In Standard", Swing_Type_Name_JP: "アウトイン・スタンダードフォーム型", Overview: "安定したスイングフォームでアウトイン軌道を作る。コントロールとパワーのバランスを重視。" },
  { id: 6, Club_Type: "アイアン", Swing_Type_Name: "Square Power", Swing_Type_Name_JP: "スクエア・パワーフォーム型", Overview: "スクエアな軌道でパワフルに振り抜くスタイル。直進性の高いボールが特徴。" },
  { id: 7, Club_Type: "アイアン", Swing_Type_Name: "Square Compact", Swing_Type_Name_JP: "スクエア・コンパクトフォーム型", Overview: "コンパクトでスクエアな軌道を作るスイング。安定感と再現性に優れる。" },
  { id: 8, Club_Type: "アイアン", Swing_Type_Name: "Straight Power", Swing_Type_Name_JP: "ストレート・パワーフォーム型", Overview: "真っすぐなスイング軌道でパワーを最大化。シンプルかつ効果的なスイング。" },
  { id: 9, Club_Type: "アイアン", Swing_Type_Name: "Straight Compact", Swing_Type_Name_JP: "ストレート・コンパクトフォーム型", Overview: "コンパクトで真っすぐなスイング軌道。再現性と正確性に優れたスタイル。" }
];

const unitMap = {
  'impactClubPath': '°', 'impactHandFirst': '', 'addressHandFirst': '', 'impactGripSpeed': 'm/s', 'maxGripSpeed': 'm/s',
  'downSwingShaftRotationMax': 'dps', 'downSwingShaftRotationMin': 'dps', 'halfwaydownFaceAngleToVertical': '°',
  'halfwaybackFaceAngleToVertical': '°', 'topFaceAngleToHorizontal': '°', 'addressLieAngle': '°',
  'estimateCarry': 'yd', 'impactHeadSpeed': 'm/s', 'impactFaceAngle': '°', 'impactLoftAngle': '°',
  'impactLieAngle': '°', 'impactAttackAngle': '°'
};

// ★★★ 指標名の表示名マッピング ★★★
const featureDisplayNameMap = {
  "addressHandFirst": "アドレス ハンドファースト",
  "addressLieAngle": "アドレス ライ角",
  "halfwaydownFaceAngleToVertical": "ハーフウェイダウン フェース角",
  "impactGripSpeed": "グリップスピード",
  "downSwingShaftRotationMax": "ダウンスイング シャフト回転",
  "halfwaybackFaceAngleToVertical": "ハーフウェイバック フェース角",
  "topFaceAngleToHorizontal": "トップ フェース角",
  "downSwingShaftRotationMin": "ダウンスイング シャフト回転"
};


// =========================
// ヘルパー関数
// =========================
function updateDate() {
  const now = new Date(); const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);
  const dateElement = document.getElementById('update-date'); if (dateElement) dateElement.textContent = `Last updated: ${formattedDate}`;
}
const displayValue = (elementId, value, decimals = 1) => {
  const element = document.getElementById(elementId);
  if (element) { const number = parseFloat(value); element.textContent = (value !== null && value !== undefined && !isNaN(number)) ? number.toFixed(decimals) : '---'; }
};
const displayPercentage = (element, value, decimals = 2) => {
  if (element) { const number = parseFloat(value); element.textContent = (value !== null && value !== undefined && !isNaN(number)) ? (number * 100).toFixed(decimals) + '%' : '---'; }
};
function addUnit(elementId, unit) {
  const element = document.getElementById(elementId); if (element && element.textContent !== '---' && unit) element.textContent += ' ' + unit;
}
function setTextContent(elementId, text) {
  const element = document.getElementById(elementId); if (element) element.textContent = text ?? '---';
}

// =========================
// テーブル表示関連関数
// =========================
function renderTableRows(data, page = 1, rowsPerPage = 8) {
  const tbody = document.getElementById('data-table-body'); if (!tbody) return; tbody.innerHTML = '';
  const start = (page - 1) * rowsPerPage; const end = start + rowsPerPage; const visibleRows = data.slice(start, end);
  if (visibleRows.length === 0) { tbody.innerHTML = '<tr><td colspan="6">表示できるデータがありません。</td></tr>'; return; }
  visibleRows.forEach((row, i) => { const tr = document.createElement('tr'); const formatNum = (val, digits = 1) => (val !== null && !isNaN(parseFloat(val))) ? parseFloat(val).toFixed(digits) : '---'; tr.innerHTML = `<td>${start + i + 1}</td><td>${formatNum(row.impactHeadSpeed)}${row.impactHeadSpeed !== null ? (' ' + (unitMap['impactHeadSpeed'] || '')) : ''}</td><td>${formatNum(row.impactClubPath)}${row.impactClubPath !== null ? (' ' + (unitMap['impactClubPath'] || '')) : ''}</td><td>${formatNum(row.impactFaceAngle)}${row.impactFaceAngle !== null ? (' ' + (unitMap['impactFaceAngle'] || '')) : ''}</td><td>${formatNum(row.impactAttackAngle)}${row.impactAttackAngle !== null ? (' ' + (unitMap['impactAttackAngle'] || '')) : ''}</td><td>${formatNum(row.estimateCarry)}${row.estimateCarry !== null ? (' ' + (unitMap['estimateCarry'] || '')) : ''}</td>`; tbody.appendChild(tr); });
}
function renderPaginationControls(data, rowsPerPage = 8) {
    const pagination = document.getElementById('pagination'); if (!pagination) return; pagination.innerHTML = ''; const pageCount = Math.ceil(data.length / rowsPerPage); if (pageCount <= 1) return; const maxVisibleButtons = 5; const prevBtn = document.createElement('button'); prevBtn.className = 'pagination-btn nav-btn'; prevBtn.textContent = '←'; prevBtn.disabled = currentPage === 1; prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTableRows(allSwingData, currentPage, rowsPerPage); renderPaginationControls(allSwingData, rowsPerPage); } }); pagination.appendChild(prevBtn); let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2)); let endPage = Math.min(pageCount, startPage + maxVisibleButtons - 1); if (endPage - startPage + 1 < maxVisibleButtons) startPage = Math.max(1, endPage - maxVisibleButtons + 1); for (let i = startPage; i <= endPage; i++) { const btn = document.createElement('button'); btn.className = 'pagination-btn'; btn.textContent = i; if (i === currentPage) btn.classList.add('active'); btn.addEventListener('click', () => { currentPage = i; renderTableRows(allSwingData, currentPage, rowsPerPage); renderPaginationControls(allSwingData, rowsPerPage); }); pagination.appendChild(btn); } const nextBtn = document.createElement('button'); nextBtn.className = 'pagination-btn nav-btn'; nextBtn.textContent = '→'; nextBtn.disabled = currentPage === pageCount; nextBtn.addEventListener('click', () => { if (currentPage < pageCount) { currentPage++; renderTableRows(allSwingData, currentPage, rowsPerPage); renderPaginationControls(allSwingData, rowsPerPage); } }); pagination.appendChild(nextBtn);
}
async function fetchAndDisplayTableData() { try { const response = await fetch('/api/data'); if (!response.ok) throw new Error(`テーブルデータ取得エラー: ${response.status}`); const data = await response.json(); if (!data || !Array.isArray(data)) throw new Error("テーブルデータが配列ではありません。"); allSwingData = data; currentPage = 1; renderTableRows(allSwingData, currentPage, rowsPerPage); renderPaginationControls(allSwingData, rowsPerPage); } catch (error) { console.error('テーブルデータ取得/表示エラー:', error); const tbody = document.getElementById('data-table-body'); const pagination = document.getElementById('pagination'); if(tbody) tbody.innerHTML = `<tr><td colspan="6">テーブルデータの読み込みに失敗しました。</td></tr>`; if(pagination) pagination.innerHTML = ''; allSwingData = []; } }

// =========================
// スイングタイプ選択エリア関連 (上部)
// =========================
function displaySelectedSwingTypeInfo(swingTypeId) {
  const typeInfo = swingTypeData.find(type => type.id === swingTypeId); if (!typeInfo) return;
  setTextContent('swing-type-name', typeInfo.Swing_Type_Name); setTextContent('club-type', typeInfo.Club_Type); setTextContent('cluster-name-jp', typeInfo.Swing_Type_Name_JP); setTextContent('swing-overview', typeInfo.Overview);
  const medianData = successMediansData[swingTypeId]; const metricsToShow = [ { id: 'swing-type-estimateCarry', jsonKey: 'estimateCarry', decimals: 2 }, { id: 'swing-type-impactHeadSpeed', jsonKey: 'impactHeadSpeed', decimals: 2 }, { id: 'swing-type-impactFaceAngle', jsonKey: 'impactFaceAngle', decimals: 2 }, { id: 'swing-type-impactClubPath', jsonKey: 'impactClubPath', decimals: 2 }, { id: 'swing-type-impactAttackAngle', jsonKey: 'impactAttackAngle', decimals: 2 } ];
  if (!medianData) { metricsToShow.forEach(metric => displayValue(metric.id, null)); return; } // ID修正
  metricsToShow.forEach(metric => { if (medianData.hasOwnProperty(metric.jsonKey)) { const value = medianData[metric.jsonKey]; displayValue(metric.id, value, metric.decimals); addUnit(metric.id, unitMap[metric.jsonKey]); } else { displayValue(metric.id, null, metric.decimals); } });
}

// =========================
// スイング分析セクション関連 (下部)
// =========================
function displayMeasuredSwingResult(swingData) {
  currentRandomSwingData = swingData; if (!swingData) return;
  const resultsToShow = [ { id: 'result-estimatecarry', bqKey: 'estimateCarry', decimals: 1 }, { id: 'result-headspeed', bqKey: 'impactHeadSpeed', decimals: 1 }, { id: 'result-faceangle', bqKey: 'impactFaceAngle', decimals: 1 }, { id: 'result-attackangle', bqKey: 'impactAttackAngle', decimals: 1 }, { id: 'result-clubpath', bqKey: 'impactClubPath', decimals: 1 }, { id: 'result-handfirst', bqKey: 'addressHandFirst', decimals: 1 }, { id: 'result-gripspeed', bqKey: 'impactGripSpeed', decimals: 1 }, { id: 'result-downswingrot', bqKey: 'downSwingShaftRotationMax', decimals: 1 }, { id: 'result-halfdownface', bqKey: 'halfwaydownFaceAngleToVertical', decimals: 1 }, { id: 'result-halfbackface', bqKey: 'halfwaybackFaceAngleToVertical', decimals: 1 }, { id: 'result-topface', bqKey: 'topFaceAngleToHorizontal', decimals: 1 } ];
  resultsToShow.forEach(item => { if (swingData.hasOwnProperty(item.bqKey)) { const value = swingData[item.bqKey]; displayValue(item.id, value, item.decimals); addUnit(item.id, unitMap[item.bqKey]); } else { displayValue(item.id, null, item.decimals); } });
}
function displaySuccessMedians(clusterId) {
  if (clusterId === null || clusterId === undefined) clusterId = null; const medianData = clusterId !== null ? successMediansData[clusterId] : null;
  const idsAndJsonKeys = [ { id: 'success-median-estimatecarry', jsonKey: 'estimateCarry', decimals: 1 }, { id: 'success-median-headspeed', jsonKey: 'impactHeadSpeed', decimals: 1 }, { id: 'success-median-faceangle', jsonKey: 'impactFaceAngle', decimals: 1 }, { id: 'success-median-attackangle', jsonKey: 'impactAttackAngle', decimals: 1 }, { id: 'success-median-clubpath', jsonKey: 'impactClubPath', decimals: 1 }, { id: 'success-median-handfirst', jsonKey: 'addressHandFirst', decimals: 1 }, { id: 'success-median-gripspeed', jsonKey: 'impactGripSpeed', decimals: 1 }, { id: 'success-median-downswingrot', jsonKey: 'downSwingShaftRotationMax', decimals: 1 }, { id: 'success-median-halfdownface', jsonKey: 'halfwaydownFaceAngleToVertical', decimals: 1 }, { id: 'success-median-halfbackface', jsonKey: 'halfwaybackFaceAngleToVertical', decimals: 1 }, { id: 'success-median-topface', jsonKey: 'topFaceAngleToHorizontal', decimals: 1 } ];
  if (!medianData && clusterId !== null) console.warn(`クラスタID ${clusterId} の成功中央値データが見つかりません。`);
  idsAndJsonKeys.forEach(item => { if (medianData && medianData.hasOwnProperty(item.jsonKey)) { const value = medianData[item.jsonKey]; displayValue(item.id, value, item.decimals); addUnit(item.id, unitMap[item.jsonKey]); } else { displayValue(item.id, null, item.decimals); } });
}
function updateAnalysisTable(judgedClusterId) {
  const tableBody = document.getElementById('analysis-table-body'); if (!tableBody) return; tableBody.innerHTML = '';
  if (judgedClusterId === null || judgedClusterId === undefined || Object.keys(clusterAnalysisData).length === 0) { const tr = document.createElement('tr'); const td = document.createElement('td'); td.colSpan = 5; td.textContent = judgedClusterId === null ? 'スイング判定ボタンを押して分析結果を表示します。' : '分析データを読み込み中...'; td.style.textAlign = 'center'; tr.appendChild(td); tableBody.appendChild(tr); return; }
  const analysisItems = clusterAnalysisData[judgedClusterId]; if (!analysisItems || analysisItems.length === 0) { const tr = document.createElement('tr'); const td = document.createElement('td'); td.colSpan = 5; td.textContent = `クラスタ ${judgedClusterId} の分析データが見つかりません。`; td.style.textAlign = 'center'; tr.appendChild(td); tableBody.appendChild(tr); return; }
  analysisItems.forEach(item => { const tr = document.createElement('tr'); const featureName = item.Feature; const tdFeature = document.createElement('td'); tdFeature.textContent = featureDisplayNameMap[featureName] || featureName || '不明'; tdFeature.style.textAlign = 'left'; tr.appendChild(tdFeature); const tdImportance = document.createElement('td'); displayPercentage(tdImportance, item.Importance, 2); tdImportance.style.textAlign = 'right'; tr.appendChild(tdImportance); const tdMedian = document.createElement('td'); const medianValue = item.Median; const medianUnit = unitMap[featureName] || ''; if (medianValue !== null && !isNaN(parseFloat(medianValue))) { tdMedian.textContent = parseFloat(medianValue).toFixed(2) + (medianUnit ? ' ' + medianUnit : ''); } else { tdMedian.textContent = '---'; } tdMedian.style.textAlign = 'right'; tr.appendChild(tdMedian); const tdYourValue = document.createElement('td'); let yourValue = null; const yourValueUnit = unitMap[featureName] || ''; if (currentRandomSwingData && currentRandomSwingData.hasOwnProperty(featureName)) { yourValue = currentRandomSwingData[featureName]; if (yourValue !== null && !isNaN(parseFloat(yourValue))) { tdYourValue.textContent = parseFloat(yourValue).toFixed(1) + (yourValueUnit ? ' ' + yourValueUnit : ''); } else { tdYourValue.textContent = '---'; } } else { tdYourValue.textContent = '---'; } tdYourValue.style.textAlign = 'right'; tr.appendChild(tdYourValue); const tdAdvice = document.createElement('td'); tdAdvice.style.textAlign = 'left'; tdAdvice.style.fontSize = '12px'; tdAdvice.style.lineHeight = '1.4'; let adviceText = '---'; const adviceSet = adviceData[featureName]; if (adviceSet && yourValue !== null && medianValue !== null && !isNaN(parseFloat(yourValue)) && !isNaN(parseFloat(medianValue))) { const yourNum = parseFloat(yourValue); const medianNum = parseFloat(medianValue); const difference = yourNum - medianNum; const threshold = Math.abs(medianNum * 0.20); const zeroThreshold = 0.1; if (Math.abs(medianNum) < zeroThreshold) { if (Math.abs(difference) <= threshold + zeroThreshold) { adviceText = adviceSet.near || '良い状態'; } else if (difference > 0) { adviceText = adviceSet.over || '> 目標(0)'; } else { adviceText = adviceSet.under || '< 目標(0)'; } } else if (Math.abs(difference) <= threshold) { adviceText = adviceSet.near || '目標に近い'; } else if (difference > 0) { adviceText = adviceSet.over || '目標より大きい'; } else { adviceText = adviceSet.under || '目標より小さい'; } } else if (adviceSet) { adviceText = "計測不可"; } else { adviceText = "アドバイスなし"; } tdAdvice.textContent = adviceText; tr.appendChild(tdAdvice); tableBody.appendChild(tr); });
}
function displayJudgeResult(judgedTypeId) {
    const resultDisplayArea = document.getElementById('judged-result-display'); const resultTextElement = document.getElementById('judged-swing-type-name-new'); if (judgedTypeId === null || judgedTypeId === undefined) { setTextContent('judged-swing-type-name-new', '判定不可'); if (resultDisplayArea) resultDisplayArea.style.display = 'block'; displaySuccessMedians(null); updateAnalysisTable(null); return; } const swingType = swingTypeData.find(type => type.id === judgedTypeId); const typeName = swingType ? swingType.Swing_Type_Name_JP : `タイプ ${judgedTypeId}`; if (resultDisplayArea) resultDisplayArea.style.display = 'none'; setTextContent('judged-swing-type-name-new', '判定中...'); setTimeout(() => { setTextContent('judged-swing-type-name-new', typeName); if (resultDisplayArea) resultDisplayArea.style.display = 'block'; }, 500); displaySuccessMedians(judgedTypeId); updateAnalysisTable(judgedTypeId);
}
function resetSwingAnalysisSection() { const resultIds = [ 'result-estimatecarry', 'result-headspeed', 'result-faceangle', 'result-attackangle', 'result-clubpath', 'result-handfirst', 'result-gripspeed', 'result-downswingrot', 'result-halfdownface', 'result-halfbackface', 'result-topface' ]; resultIds.forEach(id => displayValue(id, null)); const medianIds = [ 'success-median-estimatecarry', 'success-median-headspeed', 'success-median-faceangle', 'success-median-attackangle', 'success-median-clubpath', 'success-median-handfirst', 'success-median-gripspeed', 'success-median-downswingrot', 'success-median-halfdownface', 'success-median-halfbackface', 'success-median-topface' ]; medianIds.forEach(id => displayValue(id, null)); const resultDisplayArea = document.getElementById('judged-result-display'); if (resultDisplayArea) resultDisplayArea.style.display = 'none'; setTextContent('judged-swing-type-name-new', ''); updateAnalysisTable(null); currentRandomSwingData = null; }
function judgeSwingType(swingData, thresholds) { if (!swingData || !thresholds || thresholds.length === 0) return null; const thresholdsByCluster = thresholds.reduce((acc, rule) => { const clusterId = rule.swing_cluster; if (clusterId === undefined || clusterId === null) return acc; if (!acc[clusterId]) acc[clusterId] = []; acc[clusterId].push(rule); return acc; }, {}); const clusterIds = Object.keys(thresholdsByCluster).map(Number).sort((a, b) => a - b); for (const clusterId of clusterIds) { const rulesForCluster = thresholdsByCluster[clusterId]; let allMatch = true; for (const rule of rulesForCluster) { const featureName = rule.feature; const minThreshold = parseFloat(rule.min); const maxThreshold = parseFloat(rule.max); if (!featureName || isNaN(minThreshold) || isNaN(maxThreshold)) { allMatch = false; break; } if (swingData[featureName] === undefined) { allMatch = false; break; } const swingValue = parseFloat(swingData[featureName]); if (isNaN(swingValue)) { allMatch = false; break; } if (!(swingValue >= minThreshold && swingValue <= maxThreshold)) { allMatch = false; break; } } if (allMatch) { console.log(`★★★ クラスタ ${clusterId} に合致！ ★★★`); return clusterId; } } return null; }

// =========================
// ページ読み込み完了時の処理 (DOMContentLoaded)
// =========================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM読み込み完了、初期化開始');
  updateDate();

  const initialFetchPromises = [];
  initialFetchPromises.push( fetch('/api/median').then(res => res.ok ? res.json() : Promise.reject(new Error(`Median API エラー: ${res.status}`))).then(data => { metricsDataLoaded = true; displayValue('median-estimateCarry', data.median_estimateCarry, 1); addUnit('median-estimateCarry', unitMap['estimateCarry']); displayValue('median-impactHeadSpeed', data.median_impactHeadSpeed, 1); addUnit('median-impactHeadSpeed', unitMap['impactHeadSpeed']); displayValue('median-impactFaceAngle', data.median_impactFaceAngle, 1); addUnit('median-impactFaceAngle', unitMap['impactFaceAngle']); }).catch(err => { console.error(err); metricsDataLoaded = false; ['median-estimateCarry', 'median-impactHeadSpeed', 'median-impactFaceAngle'].forEach(id => displayValue(id, null)); }) );
  initialFetchPromises.push( fetch('/api/metrics').then(res => res.ok ? res.json() : Promise.reject(new Error(`Metrics API エラー: ${res.status}`))).then(data => { metricsDataLoaded = true; displayValue('metric-clubPath', data.median_impactClubPath, 1); addUnit('metric-clubPath', unitMap['impactClubPath']); displayValue('metric-loftAngle', data.median_impactLoftAngle, 1); addUnit('metric-loftAngle', unitMap['impactLoftAngle']); displayValue('metric-gripSpeed', data.median_maxGripSpeed, 1); addUnit('metric-gripSpeed', unitMap['maxGripSpeed']); displayValue('metric-lieAngle', data.median_impactLieAngle, 1); addUnit('metric-lieAngle', unitMap['impactLieAngle']); displayValue('metric-attackAngle', data.median_impactAttackAngle, 1); addUnit('metric-attackAngle', unitMap['impactAttackAngle']); }).catch(err => { console.error(err); ['metric-clubPath', 'metric-loftAngle', 'metric-gripSpeed', 'metric-lieAngle', 'metric-attackAngle'].forEach(id => displayValue(id, null)); }) );
  initialFetchPromises.push( fetch('/api/thresholds').then(res => { if (!res.ok) throw new Error(`閾値APIエラー: ${res.status}`); return res.json(); }).then(data => { thresholdData = Array.isArray(data) ? data : []; if (!Array.isArray(data)) console.error("閾値データが配列ではありません。"); }).catch(err => { console.error('閾値データ取得エラー:', err); thresholdData = []; }) );
  initialFetchPromises.push( fetch('/data/cluster_analysis_data.json').then(res => { if (!res.ok) throw new Error(`分析データファイル読み込みエラー: ${res.status}`); return res.json(); }).then(data => { if (Array.isArray(data)) { clusterAnalysisData = data.reduce((acc, item) => { const id = item.cluster_id; if (!acc[id]) acc[id] = []; acc[id].push(item); return acc; }, {}); } else { console.error("分析データが配列ではありません。"); clusterAnalysisData = {}; } }).catch(err => { console.error('分析データ取得/処理エラー:', err); clusterAnalysisData = {}; }) );
  initialFetchPromises.push( fetch('/data/cluster_success_medians.json').then(res => { if (!res.ok) throw new Error(`成功中央値データ読み込みエラー: ${res.status}`); return res.json(); }).then(data => { if (Array.isArray(data)) { successMediansData = data.reduce((acc, item) => { acc[item.cluster_id] = item; return acc; }, {}); } else { console.error("成功中央値データが配列ではありません。"); successMediansData = {}; } }).catch(err => { console.error('成功中央値データ取得/処理エラー:', err); successMediansData = {}; }) );
  initialFetchPromises.push( fetch('/data/onepoint_advice.json').then(res => { if (!res.ok) throw new Error(`アドバイスデータ読み込みエラー: ${res.status}`); return res.json(); }).then(data => { adviceData = data; }).catch(err => { console.error('アドバイスデータ取得/処理エラー:', err); adviceData = {}; }) );

  Promise.allSettled(initialFetchPromises).finally(() => {
     console.log("全ての初期データ取得完了。");
     fetchAndDisplayTableData();
     const swingTypeSelect = document.getElementById('swing-type-select');
     if (swingTypeSelect) {
       try {
         swingTypeSelect.innerHTML = ''; swingTypeData.forEach(type => { const option = document.createElement('option'); option.value = type.id; option.textContent = `Swing type ID ${type.id}：${type.Swing_Type_Name_JP}`; if (type.id === 0) option.selected = true; swingTypeSelect.appendChild(option); });
         const initialTypeId = parseInt(swingTypeSelect.value); displaySelectedSwingTypeInfo(initialTypeId);
         swingTypeSelect.addEventListener('change', function() { const selectedId = parseInt(this.value); displaySelectedSwingTypeInfo(selectedId); });
       } catch (error) { console.error("スイングタイプ選択エリア初期化エラー:", error); displaySelectedSwingTypeInfo(0); }
     } else { console.warn("#swing-type-select が見つかりません。"); }
     resetSwingAnalysisSection();
  });

  const judgeButton = document.getElementById('judge-my-swing-button');
  if (judgeButton) {
    judgeButton.addEventListener('click', async () => {
       console.log('スイング判定ボタンが押されました！'); const apiUrl = '/api/random-swing'; judgeButton.disabled = true; judgeButton.textContent = '判定中...'; resetSwingAnalysisSection(); try { const response = await fetch(apiUrl); if (!response.ok) { const errorData = await response.json().catch(() => null); throw new Error(`APIエラー: ${response.status}${errorData ? ` (${errorData.error})` : ''}`); } const randomSwingData = await response.json(); console.log('データ取得完了:', randomSwingData); displayMeasuredSwingResult(randomSwingData); const judgedTypeId = judgeSwingType(randomSwingData, thresholdData); console.log("判定結果ID:", judgedTypeId); displayJudgeResult(judgedTypeId); } catch (error) { console.error('判定処理エラー:', error); const resultDisplayArea = document.getElementById('judged-result-display'); setTextContent('judged-swing-type-name-new', `エラー発生`); if (resultDisplayArea) resultDisplayArea.style.display = 'block'; } finally { judgeButton.disabled = false; judgeButton.textContent = 'スイング判定'; console.log('判定処理完了'); }
    });
  } else { console.warn("#judge-my-swing-button が見つかりません。"); }

});