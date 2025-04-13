// =========================
// グローバル変数と初期データ
// =========================
let allSwingData = []; let currentPage = 1; const rowsPerPage = 8; let metricsDataLoaded = false;
// let thresholdData = []; // 不要になったのでコメントアウト
let clusterAnalysisData = {}; let currentRandomSwingData = null;
let successMediansData = {};

// ▼▼▼ 定数定義 (ここにまとめて定義) ▼▼▼
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
    'impactClubPath': '°',
    'impactHandFirst': '',
    'addressHandFirst': '',
    'impactGripSpeed': 'm/s',
    'maxGripSpeed': 'm/s',
    'downSwingShaftRotationMax': 'dps',
    'downSwingShaftRotationMin': 'dps',
    'halfwaydownFaceAngleToVertical': '°',
    'halfwaybackFaceAngleToVertical': '°',
    'topFaceAngleToHorizontal': '°',
    'addressLieAngle': '°',
    'estimateCarry': 'yd',
    'impactHeadSpeed': 'm/s',
    'impactFaceAngle': '°',
    'impactRelativeFaceAngle': '°',
    'impactLoftAngle': '°',
    'impactLieAngle': '°',
    'impactAttackAngle': '°'
};
const featureDisplayNameMap = { "addressHandFirst": "アドレス ハンドファースト", "addressLieAngle": "アドレス ライ角", "halfwaydownFaceAngleToVertical": "ハーフウェイダウン フェース角", "impactGripSpeed": "インパクト グリップ速度", "downSwingShaftRotationMax": "ダウンスイング シャフト回転(Max)", "halfwaybackFaceAngleToVertical": "ハーフウェイバック フェース角", "topFaceAngleToHorizontal": "トップ フェース角", "downSwingShaftRotationMin": "ダウンスイング シャフト回転(Min)" };
const adviceMapping = { "addressHandFirst": { "near": "ナイスアドレスっ✨その手の構え、バランス取れててすっごく綺麗だよ♡", "over": "ちょっと手が前すぎかも💦ハンドファースト意識しすぎると引っ掛けやすくなるから、気をつけてね〜", "under": "手の位置が後ろすぎちゃってるかも！クラブと体の距離感をもうちょっとだけ詰めてみて💕" }, "addressLieAngle": { "near": "構えの角度、バッチリ〜♡クラブが地面とピタッと調和してて美しいっ🌈", "over": "クラブのトゥが浮いてるかも⚠️ もっとソール全体を地面に沿わせるイメージで〜", "under": "ヒール浮いてるかも💦 ちょっとだけグリップ短めに持って調整してみて♪" }, "halfwaydownFaceAngleToVertical": { "near": "そのフェース管理、完璧っ✨プロ級のコントロールだよ〜惚れちゃうレベル♡", "over": "フェースが開きすぎちゃってるかも！ドアノブを閉めるようにシャフト回して〜🔄", "under": "閉じすぎちゃってるかも💦 フェースはスクエアに戻す意識で1時間分ドアノブ開けるイメージで！⛳" }, "impactGripSpeed": { "near": "グリップスピード、いい感じ〜！ボールに力がちゃんと伝わってるね♡", "over": "速すぎ注意っ⚠️ 手だけが先行してクラブが遅れがちかも。力をクラブに伝えて〜", "under": "ちょっとゆるゆるかも〜💦 もっと手元をビュッと鋭く動かしてみてっ！" }, "downSwingShaftRotationMax": { "near": "シャフトの回転、いいリズム〜♪ 体の動きと連動できててキレイ♡", "over": "回しすぎかもっ💫 ダウンスイングでクラブが暴れてないか確認してみよっか！", "under": "もっとスナップ利かせてシャフト回してこ〜！回転不足は飛距離ロスのもとだよ✨" }, "halfwaybackFaceAngleToVertical": { "near": "フェースの開き、ナチュラルで素敵〜✨思わずときめいちゃうっ♡", "over": "ちょっと開きすぎかも💦 フェースは空を見すぎないように、スクエア意識で♡", "under": "閉じ気味〜！フェースが地面に向きすぎてるかも。腕のローテーション自然にね♪" }, "topFaceAngleToHorizontal": { "near": "トップの形、めっちゃ綺麗！教科書に載せたいレベルだよ💖", "over": "シャットすぎるかも〜！ちょい開いて、クラブフェースが空を見上げるくらいでOK✨", "under": "オープンフェース注意⚠️ ダウンで戻せないと右にスッポ抜けちゃうから気をつけてっ！" }, "downSwingShaftRotationMin": { "near": "理想的な切り返しっ💫無理なく加速できてて最高にナチュラル♪", "over": "回しすぎかも〜！リリースが早すぎてクラブが先に解けてる感じ⚠️", "under": "回転が足りない〜💦 クラブをムチのようにしならせるイメージで下ろしてきて💕" } };

// =========================
// ヘルパー関数
// =========================
function updateDate() { const now = new Date(); const options = { year: 'numeric', month: 'short', day: 'numeric' }; const formattedDate = now.toLocaleDateString('en-US', options); const dateElement = document.getElementById('update-date'); if (dateElement) dateElement.textContent = `Last updated: ${formattedDate}`; }
const displayValue = (elementId, value, decimals = 1) => { const element = document.getElementById(elementId); if (element) { const number = parseFloat(value); element.textContent = (value !== null && value !== undefined && !isNaN(number)) ? number.toFixed(decimals) : '---'; } };
const displayPercentage = (element, value, decimals = 2) => { if (element) { const number = parseFloat(value); element.textContent = (value !== null && value !== undefined && !isNaN(number)) ? (number * 100).toFixed(decimals) + '%' : '---'; } };
function addUnit(elementId, unit) { const element = document.getElementById(elementId); if (element && element.textContent !== '---' && unit) element.textContent += ' ' + unit; }
function setTextContent(elementId, text) { const element = document.getElementById(elementId); if (element) element.textContent = text ?? '---'; }

// =========================
// テーブル表示関連関数
// =========================
function renderTableRows(data, page = 1, rowsPerPage = 8) {
  const tbody = document.getElementById('data-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const visibleRows = data.slice(start, end);
  if (visibleRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">表示できるデータがありません。</td></tr>'; // colspan=8
    return;
  }
  visibleRows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const formatNum = (val, digits = 1) => (val !== null && !isNaN(parseFloat(val))) ? parseFloat(val).toFixed(digits) : '---';
    const addUnitText = (val, key) => (val !== null && !isNaN(parseFloat(val)) && unitMap[key]) ? (' ' + unitMap[key]) : '';
    tr.innerHTML = `
      <td>${start + i + 1}</td>
      <td>${formatNum(row.estimateCarry)}${addUnitText(row.estimateCarry, 'estimateCarry')}</td>
      <td>${formatNum(row.impactHeadSpeed)}${addUnitText(row.impactHeadSpeed, 'impactHeadSpeed')}</td>
      <td>${formatNum(row.impactGripSpeed)}${addUnitText(row.impactGripSpeed, 'impactGripSpeed')}</td>
      <td>${formatNum(row.impactClubPath)}${addUnitText(row.impactClubPath, 'impactClubPath')}</td>
      <td>${formatNum(row.impactFaceAngle)}${addUnitText(row.impactFaceAngle, 'impactFaceAngle')}</td>
      <td>${formatNum(row.impactRelativeFaceAngle)}${addUnitText(row.impactRelativeFaceAngle, 'impactRelativeFaceAngle')}</td>
      <td>${formatNum(row.impactAttackAngle)}${addUnitText(row.impactAttackAngle, 'impactAttackAngle')}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPaginationControls(data, rowsPerPage = 8) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    const pageCount = Math.ceil(data.length / rowsPerPage);
    if (pageCount <= 1) return;
    const maxVisibleButtons = 5;
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn nav-btn';
    prevBtn.textContent = '←';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTableRows(allSwingData, currentPage, rowsPerPage);
            renderPaginationControls(allSwingData, rowsPerPage);
        }
    });
    pagination.appendChild(prevBtn);
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(pageCount, startPage + maxVisibleButtons - 1);
    if (endPage - startPage + 1 < maxVisibleButtons) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn';
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentPage = i;
            renderTableRows(allSwingData, currentPage, rowsPerPage);
            renderPaginationControls(allSwingData, rowsPerPage);
        });
        pagination.appendChild(btn);
    }
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn nav-btn';
    nextBtn.textContent = '→';
    nextBtn.disabled = currentPage === pageCount;
    nextBtn.addEventListener('click', () => {
        if (currentPage < pageCount) {
            currentPage++;
            renderTableRows(allSwingData, currentPage, rowsPerPage);
            renderPaginationControls(allSwingData, rowsPerPage);
        }
    });
    pagination.appendChild(nextBtn);
}

async function fetchAndDisplayTableData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error(`テーブルデータ取得エラー: ${response.status}`);
        const data = await response.json();
        if (!data || !Array.isArray(data)) throw new Error("テーブルデータが配列ではありません。");
        allSwingData = data;
        currentPage = 1;
        renderTableRows(allSwingData, currentPage, rowsPerPage);
        renderPaginationControls(allSwingData, rowsPerPage);
    } catch (error) {
        console.error('テーブルデータ取得/表示エラー:', error);
        const tbody = document.getElementById('data-table-body');
        const pagination = document.getElementById('pagination');
        if(tbody) tbody.innerHTML = `<tr><td colspan="8">テーブルデータの読み込みに失敗しました。</td></tr>`; // colspan=8
        if(pagination) pagination.innerHTML = '';
        allSwingData = [];
    }
}


// =========================
// スイングタイプ選択エリア関連 (上部)
// =========================
function displaySelectedSwingTypeInfo(swingTypeId) {
    const typeInfo = swingTypeData.find(type => type.id === swingTypeId);
    if (!typeInfo) return;
    setTextContent('swing-type-name', typeInfo.Swing_Type_Name);
    setTextContent('club-type', typeInfo.Club_Type);
    setTextContent('cluster-name-jp', typeInfo.Swing_Type_Name_JP);
    setTextContent('swing-overview', typeInfo.Overview);
    const medianData = successMediansData[swingTypeId];
    const metricsToShow = [
        { id: 'swing-type-estimateCarry', jsonKey: 'estimateCarry', decimals: 2 },
        { id: 'swing-type-impactHeadSpeed', jsonKey: 'impactHeadSpeed', decimals: 2 },
        { id: 'swing-type-impactFaceAngle', jsonKey: 'impactFaceAngle', decimals: 2 },
        { id: 'swing-type-impactClubPath', jsonKey: 'impactClubPath', decimals: 2 },
        { id: 'swing-type-impactAttackAngle', jsonKey: 'impactAttackAngle', decimals: 2 }
    ];
    if (!medianData) {
        metricsToShow.forEach(metric => displayValue(metric.id, null));
        return;
    }
    metricsToShow.forEach(metric => {
        if (medianData.hasOwnProperty(metric.jsonKey)) {
            const value = medianData[metric.jsonKey];
            displayValue(metric.id, value, metric.decimals);
            addUnit(metric.id, unitMap[metric.jsonKey]);
        } else {
            displayValue(metric.id, null, metric.decimals);
        }
    });
}

// =========================
// スイング分析セクション関連 (下部)
// =========================
function displayMeasuredSwingResult(swingData) {
    currentRandomSwingData = swingData;
    if (!swingData) return;
    const resultsToShow = [
        { id: 'result-estimatecarry', bqKey: 'estimateCarry', decimals: 1 },
        { id: 'result-headspeed', bqKey: 'impactHeadSpeed', decimals: 1 },
        { id: 'result-faceangle', bqKey: 'impactFaceAngle', decimals: 1 },
        { id: 'result-attackangle', bqKey: 'impactAttackAngle', decimals: 1 },
        { id: 'result-clubpath', bqKey: 'impactClubPath', decimals: 1 },
        { id: 'result-handfirst', bqKey: 'addressHandFirst', decimals: 1 },
        { id: 'result-gripspeed', bqKey: 'impactGripSpeed', decimals: 1 },
        { id: 'result-downswingrot', bqKey: 'downSwingShaftRotationMax', decimals: 1 },
        { id: 'result-halfdownface', bqKey: 'halfwaydownFaceAngleToVertical', decimals: 1 },
        { id: 'result-halfbackface', bqKey: 'halfwaybackFaceAngleToVertical', decimals: 1 },
        { id: 'result-topface', bqKey: 'topFaceAngleToHorizontal', decimals: 1 }
    ];
    resultsToShow.forEach(item => {
        if (swingData.hasOwnProperty(item.bqKey)) {
            const value = swingData[item.bqKey];
            displayValue(item.id, value, item.decimals);
            addUnit(item.id, unitMap[item.bqKey]);
        } else {
            displayValue(item.id, null, item.decimals);
        }
    });
}

function displaySuccessMedians(clusterId) {
    if (clusterId === null || clusterId === undefined) clusterId = null;
    const medianData = clusterId !== null ? successMediansData[clusterId] : null;
    const idsAndJsonKeys = [
        { id: 'success-median-estimatecarry', jsonKey: 'estimateCarry', decimals: 1 },
        { id: 'success-median-headspeed', jsonKey: 'impactHeadSpeed', decimals: 1 },
        { id: 'success-median-faceangle', jsonKey: 'impactFaceAngle', decimals: 1 },
        { id: 'success-median-attackangle', jsonKey: 'impactAttackAngle', decimals: 1 },
        { id: 'success-median-clubpath', jsonKey: 'impactClubPath', decimals: 1 },
        { id: 'success-median-handfirst', jsonKey: 'addressHandFirst', decimals: 1 },
        { id: 'success-median-gripspeed', jsonKey: 'impactGripSpeed', decimals: 1 },
        { id: 'success-median-downswingrot', jsonKey: 'downSwingShaftRotationMax', decimals: 1 },
        { id: 'success-median-halfdownface', jsonKey: 'halfwaydownFaceAngleToVertical', decimals: 1 },
        { id: 'success-median-halfbackface', jsonKey: 'halfwaybackFaceAngleToVertical', decimals: 1 },
        { id: 'success-median-topface', jsonKey: 'topFaceAngleToHorizontal', decimals: 1 }
    ];
    if (!medianData && clusterId !== null) console.warn(`クラスタID ${clusterId} の成功中央値データが見つかりません。`);
    idsAndJsonKeys.forEach(item => {
        if (medianData && medianData.hasOwnProperty(item.jsonKey)) {
            const value = medianData[item.jsonKey];
            displayValue(item.id, value, item.decimals);
            addUnit(item.id, unitMap[item.jsonKey]);
        } else {
            displayValue(item.id, null, item.decimals);
        }
    });
}

function updateAnalysisTable(judgedClusterId) {
    const tableBody = document.getElementById('analysis-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (judgedClusterId === null || judgedClusterId === undefined || Object.keys(clusterAnalysisData).length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = judgedClusterId === null ? 'スイング判定ボタンを押して分析結果を表示します。' : '分析データを読み込み中...';
        td.style.textAlign = 'center';
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }
    const analysisItems = clusterAnalysisData[judgedClusterId];
    if (!analysisItems || analysisItems.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = `クラスタ ${judgedClusterId} の分析データが見つかりません。`;
        td.style.textAlign = 'center';
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }
    const sortedItems = analysisItems.slice().sort((a, b) => b.Importance - a.Importance);

    sortedItems.forEach(item => {
        const tr = document.createElement('tr');
        const featureName = item.Feature;
        const tdFeature = document.createElement('td');
        tdFeature.textContent = featureDisplayNameMap[featureName] || featureName || '不明';
        tdFeature.style.textAlign = 'left';
        tr.appendChild(tdFeature);
        const tdImportance = document.createElement('td');
        displayPercentage(tdImportance, item.Importance, 2);
        tdImportance.style.textAlign = 'right';
        tr.appendChild(tdImportance);
        const tdMedian = document.createElement('td');
        const medianValue = item.Median;
        const medianUnit = unitMap[featureName] || '';
        if (medianValue !== null && !isNaN(parseFloat(medianValue))) {
            tdMedian.textContent = parseFloat(medianValue).toFixed(2) + (medianUnit ? ' ' + medianUnit : '');
        } else {
            tdMedian.textContent = '---';
        }
        tdMedian.style.textAlign = 'right';
        tr.appendChild(tdMedian);
        const tdYourValue = document.createElement('td');
        let yourValue = null;
        const yourValueUnit = unitMap[featureName] || '';
        if (currentRandomSwingData && currentRandomSwingData.hasOwnProperty(featureName)) {
            yourValue = currentRandomSwingData[featureName];
            if (yourValue !== null && !isNaN(parseFloat(yourValue))) {
                tdYourValue.textContent = parseFloat(yourValue).toFixed(1) + (yourValueUnit ? ' ' + yourValueUnit : '');
            } else {
                tdYourValue.textContent = '---';
            }
        } else {
            tdYourValue.textContent = '---';
        }
        tdYourValue.style.textAlign = 'right';
        tr.appendChild(tdYourValue);
        const tdAdvice = document.createElement('td');
        tdAdvice.style.textAlign = 'left';
        tdAdvice.style.fontSize = '12px';
        tdAdvice.style.lineHeight = '1.4';
        let adviceText = '---';
        const adviceSet = adviceMapping[featureName];
        if (adviceSet && yourValue !== null && medianValue !== null && !isNaN(parseFloat(yourValue)) && !isNaN(parseFloat(medianValue))) {
            const yourNum = parseFloat(yourValue);
            const medianNum = parseFloat(medianValue); // ★★★ ここも medianValue が正しい ★★★
            const difference = yourNum - medianNum;
            const threshold = Math.abs(medianNum * 0.20);
            const zeroThreshold = 0.1;
            if (Math.abs(medianNum) < zeroThreshold) {
                if (Math.abs(difference) <= threshold + zeroThreshold) {
                    adviceText = adviceSet.near || '良い状態';
                } else if (difference > 0) {
                    adviceText = adviceSet.over || '> 目標(0)';
                } else {
                    adviceText = adviceSet.under || '< 目標(0)';
                }
            } else if (Math.abs(difference) <= threshold) {
                adviceText = adviceSet.near || '目標に近い';
            } else if (difference > 0) {
                adviceText = adviceSet.over || '目標より大きい';
            } else {
                adviceText = adviceSet.under || '目標より小さい';
            }
        } else if (adviceSet) {
            adviceText = "計測不可";
        }
        tdAdvice.textContent = adviceText;
        tr.appendChild(tdAdvice);
        tableBody.appendChild(tr);
    });
}

function displayJudgeResult(judgedTypeId) {
    const resultDisplayArea = document.getElementById('judged-result-display');
    const resultTextElement = document.getElementById('judged-swing-type-name-new');
    const descriptionElement = document.getElementById('judged-swing-description');

    if (judgedTypeId === null || judgedTypeId === undefined) {
        setTextContent('judged-swing-type-name-new', '判定不可');
        if (resultDisplayArea) resultDisplayArea.style.display = 'block';
        if (descriptionElement) descriptionElement.textContent = 'スイングデータの取得に失敗したか、有効なクラスタ情報がありませんでした。';
        displaySuccessMedians(null);
        return;
    }

    const swingType = swingTypeData.find(type => type.id === judgedTypeId);
    const typeName = swingType ? swingType.Swing_Type_Name_JP : `タイプ ${judgedTypeId}`;
    const descriptionText = swingType ? swingType.Overview : 'このタイプの詳細な説明はありません。';

    setTextContent('judged-swing-type-name-new', typeName);
    if (resultDisplayArea) resultDisplayArea.style.display = 'block';
    if (descriptionElement) descriptionElement.textContent = descriptionText;

    displaySuccessMedians(judgedTypeId);
}


function resetSwingAnalysisSection() {
    const resultIds = [
        'result-estimatecarry', 'result-headspeed', 'result-faceangle', 'result-attackangle', 'result-clubpath',
        'result-handfirst', 'result-gripspeed', 'result-downswingrot', 'result-halfdownface', 'result-halfbackface', 'result-topface'
    ];
    resultIds.forEach(id => displayValue(id, null));
    const medianIds = [
        'success-median-estimatecarry', 'success-median-headspeed', 'success-median-faceangle', 'success-median-attackangle', 'success-median-clubpath',
        'success-median-handfirst', 'success-median-gripspeed', 'success-median-downswingrot', 'success-median-halfdownface', 'success-median-halfbackface', 'success-median-topface'
    ];
    medianIds.forEach(id => displayValue(id, null));
    const resultDisplayArea = document.getElementById('judged-result-display');
    if (resultDisplayArea) resultDisplayArea.style.display = 'none';
    setTextContent('judged-swing-type-name-new', '');
    const descriptionElement = document.getElementById('judged-swing-description');
    if (descriptionElement) descriptionElement.textContent = '';
    updateAnalysisTable(null);
    currentRandomSwingData = null;
}

// ▼▼▼ judgeSwingType 関数は不要なのでコメントアウト ▼▼▼
/*
function judgeSwingType(swingData, thresholds) {
    // ... (この関数の中身全体) ...
}
*/


// =========================
// ページ読み込み完了時の処理 (DOMContentLoaded)
// =========================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM読み込み完了、初期化開始');
  updateDate();

  const initialFetchPromises = [];
  // メインメトリクス
  initialFetchPromises.push(
    fetch('/api/median')
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`Median API エラー: ${res.status}`)))
      .then(data => {
        metricsDataLoaded = true;
        displayValue('median-estimateCarry', data.median_estimateCarry, 1);
        addUnit('median-estimateCarry', unitMap['estimateCarry']);
        displayValue('median-impactHeadSpeed', data.median_impactHeadSpeed, 1);
        addUnit('median-impactHeadSpeed', unitMap['impactHeadSpeed']);
        displayValue('median-impactFaceAngle', data.median_impactFaceAngle, 1);
        addUnit('median-impactFaceAngle', unitMap['impactFaceAngle']);
      })
      .catch(err => {
        console.error('メインメトリクス取得エラー:', err);
        metricsDataLoaded = false;
        ['median-estimateCarry', 'median-impactHeadSpeed', 'median-impactFaceAngle'].forEach(id => displayValue(id, null));
      })
  );
  // サブメトリクス
  initialFetchPromises.push(
    fetch('/api/metrics')
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`Metrics API エラー: ${res.status}`)))
      .then(data => {
        displayValue('metric-clubPath', data.median_impactClubPath, 1);
        addUnit('metric-clubPath', unitMap['impactClubPath']);
        displayValue('metric-loftAngle', data.median_impactLoftAngle, 1);
        addUnit('metric-loftAngle', unitMap['impactLoftAngle']);
        displayValue('metric-gripSpeed', data.median_maxGripSpeed, 1);
        addUnit('metric-gripSpeed', unitMap['maxGripSpeed']);
        displayValue('metric-lieAngle', data.median_impactLieAngle, 1);
        addUnit('metric-lieAngle', unitMap['impactLieAngle']);
        displayValue('metric-attackAngle', data.median_impactAttackAngle, 1);
        addUnit('metric-attackAngle', unitMap['impactAttackAngle']);
      })
      .catch(err => {
        console.error('サブメトリクス取得エラー:', err);
        ['metric-clubPath', 'metric-loftAngle', 'metric-gripSpeed', 'metric-lieAngle', 'metric-attackAngle'].forEach(id => displayValue(id, null));
      })
  );
  // 分析データ(JSON)取得
  initialFetchPromises.push(
    fetch('/data/cluster_analysis_data.json')
      .then(res => { if (!res.ok) throw new Error(`分析データファイル読み込みエラー: ${res.status}`); return res.json(); })
      .then(data => {
        if (Array.isArray(data)) {
          clusterAnalysisData = data.reduce((acc, item) => {
            const id = item.cluster_id;
            if (!acc[id]) acc[id] = [];
            acc[id].push(item);
            return acc;
          }, {});
          Object.values(clusterAnalysisData).forEach(arr => arr.sort((a, b) => b.Importance - a.Importance));
          console.log(`分析データを ${Object.keys(clusterAnalysisData).length} クラスタ分処理しました。`);
        } else {
          console.error("分析データが配列ではありません。");
          clusterAnalysisData = {};
        }
      })
      .catch(err => {
        console.error('分析データ取得/処理エラー:', err);
        clusterAnalysisData = {};
      })
  );
  // 成功中央値データ(JSON)取得
  initialFetchPromises.push(
    fetch('/data/cluster_success_medians.json')
      .then(res => { if (!res.ok) throw new Error(`成功中央値データ読み込みエラー: ${res.status}`); return res.json(); })
      .then(data => {
        if (Array.isArray(data)) {
          successMediansData = data.reduce((acc, item) => {
            acc[item.cluster_id] = item;
            return acc;
          }, {});
          console.log(`成功中央値データを ${Object.keys(successMediansData).length} クラスタ分取得しました。`);
        } else {
          console.error("成功中央値データが配列ではありません。");
          successMediansData = {};
        }
      })
      .catch(err => {
        console.error('成功中央値データ取得/処理エラー:', err);
        successMediansData = {};
      })
  );

  /* // 閾値データ取得は不要
  initialFetchPromises.push(
    fetch('/api/thresholds')
      // ... (省略) ...
  );
  */


  // 全ての初期データ取得を待つ
  Promise.allSettled(initialFetchPromises).finally(() => {
     console.log("全ての初期データ取得完了。");
     fetchAndDisplayTableData();

     const swingTypeSelect = document.getElementById('swing-type-select');
     if (swingTypeSelect) {
         try {
             swingTypeSelect.innerHTML = '';
             swingTypeData.forEach(type => {
                 const option = document.createElement('option');
                 option.value = type.id;
                 option.textContent = `Swing type ID ${type.id}：${type.Swing_Type_Name_JP}`;
                 if (type.id === 0) option.selected = true;
                 swingTypeSelect.appendChild(option);
             });
             const initialTypeId = parseInt(swingTypeSelect.value);
             displaySelectedSwingTypeInfo(initialTypeId);
             swingTypeSelect.addEventListener('change', function() {
                 const selectedId = parseInt(this.value);
                 displaySelectedSwingTypeInfo(selectedId);
             });
         } catch (error) {
             console.error("スイングタイプ選択エリア初期化エラー:", error);
             displaySelectedSwingTypeInfo(0);
         }
     } else {
         console.warn("#swing-type-select が見つかりません。");
     }
     resetSwingAnalysisSection();
  });

  // ▼▼▼ スイング判定ボタンのイベントリスナー (音声生成機能付き, medianNum修正済み) ▼▼▼
  const judgeButton = document.getElementById('judge-my-swing-button');
  if (judgeButton) {
      judgeButton.addEventListener('click', async () => { // async は維持
          console.log('スイング判定ボタンが押されました！(音声生成版)');
          const apiUrl = '/api/random-swing';
          const speechApiUrl = '/api/generate-speech'; // 音声生成APIのURL
          const audioElement = document.getElementById('advice-audio'); // audio要素を取得

          judgeButton.disabled = true;
          judgeButton.textContent = 'AI解析中...';
          resetSwingAnalysisSection();

          let clusterIdToShow = null; // 表示するクラスタIDを保持する変数
          let analysisCompleted = false; // 分析が正常に完了したか

          try {
              // 1. ランダムなスイングデータを取得
              const response = await fetch(apiUrl);
              if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ error: '不明なエラー' }));
                  throw new Error(`スイングデータ取得APIエラー: ${response.status} ${errorData.error}`);
              }
              const randomSwingData = await response.json();
              console.log('ランダムスイングデータ取得完了:', randomSwingData);

              if (!randomSwingData || Object.keys(randomSwingData).length === 0) {
                  throw new Error('取得したスイングデータが空です。');
              }

              // 2. スイングデータを画面に表示
              displayMeasuredSwingResult(randomSwingData);

              // 3. 元データのクラスタIDを取得
              const originalClusterId = randomSwingData.swing_cluster_unified;
              console.log("元データのクラスタID:", originalClusterId);

              if (originalClusterId === undefined || originalClusterId === null) {
                 throw new Error("取得データに有効なクラスタIDが含まれていません。");
              }

              clusterIdToShow = parseInt(originalClusterId, 10); // 表示用IDを確定
              if (isNaN(clusterIdToShow) || clusterIdToShow < 0 || clusterIdToShow > 9) {
                   throw new Error(`無効なクラスタID (${originalClusterId}) が取得されました。`);
              }

              // 4. クラスタ名などを表示 (AI解析中の演出は音声生成の後で行う)
              console.log(`結果表示の準備 (クラスタ ${clusterIdToShow})`);
              displayJudgeResult(clusterIdToShow); // タイプ名、概要、成功中央値を表示
              updateAnalysisTable(clusterIdToShow); // 詳細分析テーブルを表示
              analysisCompleted = true; // ここまで来たら分析は成功

              // --- ここから音声生成処理 ---
              console.log("音声アドバイス生成開始...");

              // 5. 読み上げるアドバイス文を生成
              let adviceTextToSpeak = ""; // 生成するテキスト全体

              // --- 5.1. クラスタ分類結果 ---
              const swingType = swingTypeData.find(type => type.id === clusterIdToShow);
              const clusterNameJP = swingType ? swingType.Swing_Type_Name_JP : `タイプ ${clusterIdToShow}`;
              adviceTextToSpeak += `あなたのスイングクラスタは ${clusterNameJP} です。\n`;

              // --- 5.2. 主要な結果数値 ---
              const estimateCarry = currentRandomSwingData?.estimateCarry;
              const headSpeed = currentRandomSwingData?.impactHeadSpeed;
              const faceAngle = currentRandomSwingData?.impactFaceAngle;

              let faceAngleDesc = "";
              const faceAngleNum = parseFloat(faceAngle);
              const faceAngleThreshold = 1.5;
              if (!isNaN(faceAngleNum)) {
                  if (Math.abs(faceAngleNum) <= faceAngleThreshold) {
                      faceAngleDesc = "スクエア";
                  } else if (faceAngleNum > faceAngleThreshold) {
                      faceAngleDesc = "オープン";
                  } else {
                      faceAngleDesc = "クローズ";
                  }
              }

              const formatNumSpeech = (val, decimals = 0) => {
                  const num = parseFloat(val);
                  return isNaN(num) ? "不明" : num.toFixed(decimals);
              };

              adviceTextToSpeak += `推定飛距離は ${formatNumSpeech(estimateCarry, 0)} ヤード、`;
              adviceTextToSpeak += `ヘッドスピードは ${formatNumSpeech(headSpeed, 1)} 、`;
              adviceTextToSpeak += `フェース角は ${formatNumSpeech(faceAngle, 1)} 度 ${faceAngleDesc} です。\n`;

              // --- 5.3. 重要指標トップ3の比較とアドバイス ---
              const topAnalysisItems = clusterAnalysisData[clusterIdToShow]?.slice(0, 3) || [];
              if (topAnalysisItems.length > 0) {
                  adviceTextToSpeak += "成功スイングへ寄与度が高いプロセスの数値です。\n";
                  topAnalysisItems.forEach(item => {
                      const featureName = item.Feature;
                      const displayName = featureDisplayNameMap[featureName] || featureName;
                      const medianValue = parseFloat(item.Median);
                      const yourValueRaw = currentRandomSwingData?.[featureName];
                      const yourValue = parseFloat(yourValueRaw);
                      const unit = unitMap[featureName] || '';
                      const adviceSet = adviceMapping[featureName];
                      let simpleAdviceText = "アドバイスはありません。";

                      if (adviceSet && !isNaN(yourValue) && !isNaN(medianValue)) {
                          const difference = yourValue - medianValue;
                          const threshold = Math.abs(medianValue * 0.20);
                          const zeroThreshold = 0.1;
                          if (Math.abs(medianValue) < zeroThreshold) { // ★★★ medianNum -> medianValue に修正 ★★★
                              if (Math.abs(difference) <= threshold + zeroThreshold) { simpleAdviceText = adviceSet.near; }
                              else if (difference > 0) { simpleAdviceText = adviceSet.over; }
                              else { simpleAdviceText = adviceSet.under; }
                          } else if (Math.abs(difference) <= threshold) {
                              simpleAdviceText = adviceSet.near;
                          } else if (difference > 0) {
                              simpleAdviceText = adviceSet.over;
                          } else {
                              simpleAdviceText = adviceSet.under;
                          }
                          simpleAdviceText = simpleAdviceText || "アドバイスの取得に失敗";
                      } else if (adviceSet) {
                          simpleAdviceText = "あなたの数値を計測できませんでした";
                      }

                      const medianFormatted = formatNumSpeech(medianValue, 1);
                      const yourFormatted = formatNumSpeech(yourValue, 1);

                      adviceTextToSpeak += `${displayName} は目標目安 ${medianFormatted} ${unit} に対して、${yourFormatted} ${unit} です。${simpleAdviceText}\n`;
                  });
              }

              console.log("--- 生成された読み上げテキスト ---");
              console.log(adviceTextToSpeak);
              console.log("---------------------------------");


              // 6. サーバーの音声生成APIを呼び出す
              const speechResponse = await fetch(speechApiUrl, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      text: adviceTextToSpeak,
                      voice: 'nova' // ★ 声を変更したい場合はここを編集 ★
                  }),
              });

              if (!speechResponse.ok) {
                  const errorData = await speechResponse.json().catch(() => ({ error: '音声生成APIからのエラー詳細不明' }));
                  throw new Error(`音声生成APIエラー: ${speechResponse.status} ${errorData.error}`);
              }

              // 7. レスポンス（MP3データ）をBlobとして取得
              const audioBlob = await speechResponse.blob();
              console.log('音声データ(Blob)取得完了:', audioBlob);

              // 8. BlobからURLを生成し、audio要素で再生
              if (audioElement && audioBlob.size > 0) {
                  const audioUrl = URL.createObjectURL(audioBlob);
                  audioElement.src = audioUrl;
                  audioElement.onended = () => {
                      URL.revokeObjectURL(audioUrl);
                      console.log('音声再生完了、URL解放');
                  };
                  try {
                      await audioElement.play();
                      console.log('音声再生開始');
                  } catch (playError) {
                      console.error("音声の自動再生に失敗しました:", playError);
                  }

              } else if (!audioElement) {
                 console.error("audio要素が見つかりません。");
              } else {
                 console.warn("受信した音声データが空です。");
              }
              // --- 音声生成処理ここまで ---

          } catch (error) {
              console.error('判定または音声生成処理エラー:', error);

              // エラーメッセージを表示
              const resultDisplayArea = document.getElementById('judged-result-display');
              setTextContent('judged-swing-type-name-new', `エラー発生`);
              if (resultDisplayArea) resultDisplayArea.style.display = 'block';
              const descriptionElement = document.getElementById('judged-swing-description');
              if (descriptionElement) descriptionElement.textContent = `エラー: ${error.message}`;

              // エラー時は分析内容をクリア
              if (!analysisCompleted) {
                 resetSwingAnalysisSection();
              } else if(clusterIdToShow !== null) {
                 // 分析は終わっていたが表示だけエラーの場合
              }

          } finally {
              // ボタンの状態を元に戻す
              judgeButton.disabled = false;
              judgeButton.textContent = 'スイング判定';
              console.log('ボタン処理完了');
          }
      });
  } else {
      console.warn("#judge-my-swing-button が見つかりません。");
  }
  // ▲▲▲ イベントリスナーの修正ここまで ▲▲▲

}); // DOMContentLoaded の閉じ括弧