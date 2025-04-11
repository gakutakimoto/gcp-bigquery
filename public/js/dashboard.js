// =========================
// グローバル変数と初期データ
// =========================
let allSwingData = []; // テーブル表示用の全データ
let currentPage = 1;   // テーブルの現在のページ番号
const rowsPerPage = 8; // テーブルの1ページあたりの行数
let metricsDataLoaded = false; // APIから指標中央値が読み込まれたかのフラグ
let thresholdData = []; // クラスタ判定の閾値データ

// スイングタイプに関する静的データ (判定結果表示やドロップダウンに使用)
const swingTypeData = [
  { id: 0, Club_Type: "ドライバー", Swing_Type_Name: "Out-In Power", Swing_Type_Name_JP: "アウトイン・パワーフォーム型", Overview: "パワフルなスイングで球の飛距離を重視。アウトインの軌道で力強く振り抜く。", impactClubPath: -7.2, impactAttackAngle: 2.8, impactHeadSpeed: 41.5, impactFaceAngle: -4.6, estimateCarry: 238.4 },
  { id: 1, Club_Type: "ドライバー", Swing_Type_Name: "Out-In Compact", Swing_Type_Name_JP: "アウトイン・コンパクトフォーム型", Overview: "コンパクトなスイングでコントロール重視。アウトインの軌道で正確性を高める。", impactClubPath: -5.4, impactAttackAngle: 1.3, impactHeadSpeed: 35.2, impactFaceAngle: -3.2, estimateCarry: 182.6 },
  { id: 2, Club_Type: "ドライバー", Swing_Type_Name: "Flexible Inside-Out", Swing_Type_Name_JP: "インアウト・フレキシブルフォーム型", Overview: "柔軟なフォームでスイング軌道に変化があり、状況対応力が高いスタイル。", impactClubPath: 9.05, impactAttackAngle: -0.05, impactHeadSpeed: 38.87, impactFaceAngle: 8.29, estimateCarry: 206.06 },
  { id: 3, Club_Type: "ドライバー", Swing_Type_Name: "Inside-Out Power", Swing_Type_Name_JP: "インアウト・パワーフォーム型", Overview: "インアウトの軌道でパワーを活かしたスイング。ドローボールを打ちやすいスタイル。", impactClubPath: 8.5, impactAttackAngle: 1.9, impactHeadSpeed: 40.2, impactFaceAngle: 5.3, estimateCarry: 228.7 },
  { id: 4, Club_Type: "ドライバー", Swing_Type_Name: "Inside-Out Standard", Swing_Type_Name_JP: "インアウト・スタンダードフォーム型", Overview: "バランスのとれたフォームでインアウト軌道を実現。安定感のあるスイング。", impactClubPath: 6.8, impactAttackAngle: 1.2, impactHeadSpeed: 37.5, impactFaceAngle: 4.1, estimateCarry: 196.3 },
  { id: 5, Club_Type: "アイアン", Swing_Type_Name: "Out-In Standard", Swing_Type_Name_JP: "アウトイン・スタンダードフォーム型", Overview: "安定したスイングフォームでアウトイン軌道を作る。コントロールとパワーのバランスを重視。", impactClubPath: -6.3, impactAttackAngle: 2.1, impactHeadSpeed: 38.1, impactFaceAngle: -3.8, estimateCarry: 201.8 },
  { id: 6, Club_Type: "アイアン", Swing_Type_Name: "Square Power", Swing_Type_Name_JP: "スクエア・パワーフォーム型", Overview: "スクエアな軌道でパワフルに振り抜くスタイル。直進性の高いボールが特徴。", impactClubPath: 0.8, impactAttackAngle: 3.2, impactHeadSpeed: 39.8, impactFaceAngle: 0.6, estimateCarry: 216.4 },
  { id: 7, Club_Type: "アイアン", Swing_Type_Name: "Square Compact", Swing_Type_Name_JP: "スクエア・コンパクトフォーム型", Overview: "コンパクトでスクエアな軌道を作るスイング。安定感と再現性に優れる。", impactClubPath: 0.3, impactAttackAngle: 2.7, impactHeadSpeed: 34.6, impactFaceAngle: 0.2, estimateCarry: 176.5 },
  { id: 8, Club_Type: "アイアン", Swing_Type_Name: "Straight Power", Swing_Type_Name_JP: "ストレート・パワーフォーム型", Overview: "真っすぐなスイング軌道でパワーを最大化。シンプルかつ効果的なスイング。", impactClubPath: 1.2, impactAttackAngle: 3.6, impactHeadSpeed: 40.5, impactFaceAngle: 1.1, estimateCarry: 220.3 },
  { id: 9, Club_Type: "アイアン", Swing_Type_Name: "Straight Compact", Swing_Type_Name_JP: "ストレート・コンパクトフォーム型", Overview: "コンパクトで真っすぐなスイング軌道。再現性と正確性に優れたスタイル。", impactClubPath: 0.9, impactAttackAngle: 2.4, impactHeadSpeed: 33.8, impactFaceAngle: 0.7, estimateCarry: 172.1 }
];


// =========================
// ヘルパー関数
// =========================

// 日付を更新する関数
function updateDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);
  const dateElement = document.getElementById('update-date');
  if (dateElement) {
    dateElement.textContent = `Last updated: ${formattedDate}`;
  } else {
    console.warn("要素 #update-date が見つかりません。");
  }
}

// 数値を指定された桁数で表示するヘルパー関数
const displayValue = (elementId, value, decimals = 1) => {
  const element = document.getElementById(elementId);
  if (element) {
    const number = parseFloat(value);
    element.textContent = (value !== null && value !== undefined && !isNaN(number))
                          ? number.toFixed(decimals)
                          : '---';
  } else {
     // console.warn(`要素 #${elementId} が見つかりません。`); // デバッグ時以外はコメントアウト推奨
  }
};

// =========================
// テーブル表示関連関数
// =========================

// テーブル行をレンダリング
function renderTableRows(data, page = 1, rowsPerPage = 8) {
  const tbody = document.getElementById('data-table-body');
  if (!tbody) { console.error("要素 #data-table-body が見つかりません。"); return; }
  tbody.innerHTML = ''; // クリア

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const visibleRows = data.slice(start, end);

  if (visibleRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">表示できるデータがありません。</td></tr>'; // 列数注意
    return;
  }

  visibleRows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const formatNum = (val, digits = 1) => (val !== null && val !== undefined && !isNaN(parseFloat(val))) ? parseFloat(val).toFixed(digits) : '---'; // toFixedの前に数値変換
    tr.innerHTML = `
      <td>${start + i + 1}</td>
      <td>${formatNum(row.impactHeadSpeed)}</td>
      <td>${formatNum(row.impactClubPath)}</td>
      <td>${formatNum(row.impactFaceAngle)}</td>
      <td>${formatNum(row.impactAttackAngle)}</td>
      <td>${formatNum(row.estimateCarry)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ページネーションコントロールをレンダリング
function renderPaginationControls(data, rowsPerPage = 8) {
    const pagination = document.getElementById('pagination');
    if (!pagination) { console.error("要素 #pagination が見つかりません。"); return; }
    pagination.innerHTML = ''; // クリア

    const pageCount = Math.ceil(data.length / rowsPerPage);
    if (pageCount <= 1) return; // ページが1つ以下なら不要

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

// テーブル用データを取得して表示するメイン関数
async function fetchAndDisplayTableData() {
  try {
    console.log('テーブルデータ取得中 (/api/data)...');
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error(`テーブルデータ取得エラー: ${response.status}`);
    const data = await response.json();
    console.log('テーブルデータ受信:', data ? `${data.length}件` : 'データなし');

    if (!data || !Array.isArray(data)) {
      throw new Error("受信したテーブルデータが配列ではありません。");
    }
    allSwingData = data;
    currentPage = 1;
    renderTableRows(allSwingData, currentPage, rowsPerPage);
    renderPaginationControls(allSwingData, rowsPerPage);
  } catch (error) {
    console.error('テーブルデータ取得/表示エラー:', error);
    const tbody = document.getElementById('data-table-body');
    const pagination = document.getElementById('pagination');
    if(tbody) tbody.innerHTML = `<tr><td colspan="6">テーブルデータの読み込みに失敗しました。</td></tr>`;
    if(pagination) pagination.innerHTML = '';
    allSwingData = [];
  }
}

// =========================
// スイングタイプ関連関数
// =========================

// 選択されたスイングタイプ情報を表示 (ドロップダウン用)
function displaySwingTypeInfo(swingType) {
  if (!swingType) return;
  console.log("表示するスイングタイプ情報(ドロップダウン):", swingType);
  const ids = { name: 'swing-type-name', club: 'club-type', jpName: 'cluster-name-jp', overview: 'swing-overview',
                 carry: 'type-estimateCarry', speed: 'type-impactHeadSpeed', faceAngle: 'type-impactFaceAngle',
                 clubPath: 'type-impactClubPath', attackAngle: 'type-impactAttackAngle' };

  const nameEl = document.getElementById(ids.name);
  const clubEl = document.getElementById(ids.club);
  const jpNameEl = document.getElementById(ids.jpName);
  const overviewEl = document.getElementById(ids.overview);
  const carryEl = document.getElementById(ids.carry);
  const speedEl = document.getElementById(ids.speed);
  const faceAngleEl = document.getElementById(ids.faceAngle);
  const clubPathEl = document.getElementById(ids.clubPath);
  const attackAngleEl = document.getElementById(ids.attackAngle);

  if (nameEl) nameEl.textContent = swingType.Swing_Type_Name || '---';
  if (clubEl) clubEl.textContent = swingType.Club_Type || '---';
  if (jpNameEl) jpNameEl.textContent = swingType.Swing_Type_Name_JP || '---';
  if (overviewEl) overviewEl.textContent = swingType.Overview || '説明なし';

  displayValue(ids.carry, swingType.estimateCarry, 2);
  displayValue(ids.speed, swingType.impactHeadSpeed, 2);
  displayValue(ids.faceAngle, swingType.impactFaceAngle, 2);
  displayValue(ids.clubPath, swingType.impactClubPath, 2);
  displayValue(ids.attackAngle, swingType.impactAttackAngle, 2);

  // 単位追記
  if (carryEl && carryEl.textContent !== '---') carryEl.textContent += ' yd';
  if (speedEl && speedEl.textContent !== '---') speedEl.textContent += ' m/s';
  if (faceAngleEl && faceAngleEl.textContent !== '---') faceAngleEl.textContent += '°';
  if (clubPathEl && clubPathEl.textContent !== '---') clubPathEl.textContent += '°';
  if (attackAngleEl && attackAngleEl.textContent !== '---') attackAngleEl.textContent += '°';
}

// =========================
// スイング判定機能関連
// =========================

// BigQueryから取得したランダムなスイングデータを表示する関数
// ★★★ この関数内の bqData.カラム名 は、あなたのBigQueryテーブルのカラム名に合わせてください ★★★
function displayMySwingValues(bqData) {
  console.log('表示するBigQueryデータ:', bqData);
  if (!bqData) {
      console.error("displayMySwingValues に無効なデータが渡されました。");
      resetMeasuredValuesDisplay(); return;
  }
  // --- 「あなたのスイング各種数値は」エリアの表示 ---
  // ★★★ bqData.xxx の xxx は BigQuery のカラム名と完全に一致させる ★★★
  displayValue('measured-clubpath', bqData.impactClubPath);
  displayValue('measured-handfirst', bqData.impactHandFirst);
  displayValue('measured-gripspeed', bqData.impactGripSpeed);
  displayValue('measured-downswingrotmax', bqData.downSwingShaftRotationMax);
  displayValue('measured-halfdownfacevert', bqData.halfwaydownFaceAngleToVertical);
  displayValue('measured-halfbackfacevert', bqData.halfwaybackFaceAngleToVertical);
  displayValue('measured-topfacehoriz', bqData.topFaceAngleToHorizontal);

  // --- 詳細分析テーブルの「あなたの数値」列の表示 ---
  const analysisTableBody = document.getElementById('analysis-table-body');
  if (analysisTableBody) {
    // ★★★ こちらも bqData.カラム名 を BigQuery のカラム名と合わせる ★★★
    displayValue('analysis-halfdownfacevert', bqData.halfwaydownFaceAngleToVertical);
    displayValue('analysis-downswingrotmax', bqData.downSwingShaftRotationMax);
    displayValue('analysis-downswingrotmin', bqData.downSwingShaftRotationMin); // カラムが存在すれば表示
    displayValue('analysis-gripspeed', bqData.impactGripSpeed);
    displayValue('analysis-handfirst', bqData.addressHandFirst);    // カラムが存在すれば表示
    displayValue('analysis-topfacehoriz', bqData.topFaceAngleToHorizontal);
    displayValue('analysis-halfbackfacevert', bqData.halfwaybackFaceAngleToVertical);
    displayValue('analysis-lieangle', bqData.addressLieAngle);     // カラムが存在すれば表示
  } else {
    console.warn("要素 #analysis-table-body が見つかりません。");
  }
}

// エラー発生時などに「あなたのスイング各種数値は」エリアなどをリセットする関数
function resetMeasuredValuesDisplay() {
  const idsToReset = [
    'measured-clubpath', 'measured-handfirst', 'measured-gripspeed',
    'measured-downswingrotmax', 'measured-halfdownfacevert',
    'measured-halfbackfacevert', 'measured-topfacehoriz',
    'analysis-halfdownfacevert', 'analysis-downswingrotmax', 'analysis-downswingrotmin',
    'analysis-gripspeed', 'analysis-handfirst', 'analysis-topfacehoriz',
    'analysis-halfbackfacevert', 'analysis-lieangle'
  ];
  idsToReset.forEach(id => displayValue(id, null)); // '---' 表示にする

  const judgedTypeNameEl = document.getElementById('judged-swing-type-name');
  const judgedOverviewEl = document.getElementById('judged-swing-overview');
  if(judgedTypeNameEl) judgedTypeNameEl.textContent = '---';
  if(judgedOverviewEl) judgedOverviewEl.textContent = '';
}

// --- スイングタイプを判定する関数 ---
// swingData: 判定対象のスイングデータ (BigQueryから取得した1行)
// thresholds: 閾値データ (APIから取得した全ルール)
function judgeSwingType(swingData, thresholds) {
  if (!swingData || !thresholds || thresholds.length === 0) {
    console.log("判定データまたは閾値データが不足しています。");
    return null; // 判定不可
  }
  console.log("判定対象データ:", swingData);
  console.log("使用する閾値データ:", thresholds.length > 0 ? "あり" : "なし");

  // クラスタIDごとに閾値データをグループ化
  const thresholdsByCluster = thresholds.reduce((acc, rule) => {
    const clusterId = rule.swing_cluster; // BigQueryの閾値テーブルのカラム名に合わせる
    if (!acc[clusterId]) acc[clusterId] = [];
    acc[clusterId].push(rule);
    return acc;
  }, {});

  // クラスタID 0 から順番にチェック (昇順ソートを保証するためキーを取得してソート)
  const clusterIds = Object.keys(thresholdsByCluster).map(Number).sort((a, b) => a - b);

  for (const clusterId of clusterIds) {
    const rulesForCluster = thresholdsByCluster[clusterId];
    let allMatch = true; // このクラスタの全ルールに一致したかのフラグ
    // console.log(`--- クラスタ ${clusterId} の判定開始 ---`);

    for (const rule of rulesForCluster) {
      const featureName = rule.feature; // 閾値テーブルのカラム名に合わせる
      const minThreshold = parseFloat(rule.min); // 閾値テーブルのカラム名に合わせる
      const maxThreshold = parseFloat(rule.max); // 閾値テーブルのカラム名に合わせる

      // 判定対象のスイングデータに該当するカラムがあるかチェック
      if (swingData[featureName] === undefined) {
        console.log(`    -> 判定不能: スイングデータに ${featureName} がありません。`);
        allMatch = false;
        break; // このクラスタは判定不可
      }

      const swingValue = parseFloat(swingData[featureName]);

      // 値が数値として有効かチェック
      if (isNaN(swingValue)) {
        console.log(`    -> 判定不能: スイングデータの ${featureName} が数値ではありません。`);
        allMatch = false;
        break; // このクラスタは判定不可
      }

      // console.log(`  [${featureName}] 値:${swingValue} vs 範囲:[${minThreshold} ～ ${maxThreshold}]`);

      // 閾値の範囲内かチェック
      if (!(swingValue >= minThreshold && swingValue <= maxThreshold)) {
        // console.log(`    -> 不一致`);
        allMatch = false;
        break; // 一つでも範囲外なら、このクラスタは不一致
      } else {
        // console.log(`    -> 一致`);
      }
    }

    if (allMatch) {
      console.log(`★★★ クラスタ ${clusterId} に合致しました！ ★★★`);
      return clusterId; // 合致したクラスタIDを返す
    }
  }

  console.log("どのクラスタの条件にも完全に一致しませんでした。");
  return null; // どのタイプにも当てはまらない
}

// --- 判定結果のスイングタイプ情報を表示する関数 ---
function displayJudgedSwingType(swingType) {
    const judgedTypeNameEl = document.getElementById('judged-swing-type-name');
    const judgedOverviewEl = document.getElementById('judged-swing-overview');

    if (!swingType) {
        if(judgedTypeNameEl) judgedTypeNameEl.textContent = 'タイプ判定不可';
        if(judgedOverviewEl) judgedOverviewEl.textContent = '条件に合致するスイングタイプが見つかりませんでした。';
        // ★★★ 必要なら詳細分析テーブルの内容もリセット or デフォルト表示にする ★★★
        return;
    }

    console.log("判定結果として表示するスイングタイプ:", swingType);
    if(judgedTypeNameEl) judgedTypeNameEl.textContent = swingType.Swing_Type_Name_JP || '名称不明';
    if(judgedOverviewEl) judgedOverviewEl.textContent = swingType.Overview || '説明なし';

    // ★★★ 詳細分析テーブルの「目標数値」「寄与度」を動的に更新 ★★★
    // この機能が必要な場合は、swingTypeData にその情報を含め、
    // ここで対応するHTML要素 (例: <td id="target-value-xxx">) の内容を更新する
    console.log("詳細分析テーブルの目標値等の更新は未実装です。");
}

// =========================
// ページ読み込み完了時の処理 (DOMContentLoaded)
// =========================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM読み込み完了、初期化開始');

  // --- ① 日付更新 ---
  updateDate();

  // --- ② APIから各種初期データを並行取得 ---
  const initialFetchPromises = [];

  // 中央値取得
  initialFetchPromises.push(
    fetch('/api/median')
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`Median API エラー: ${res.status}`)))
      .then(data => {
        console.log('メイン指標データ受信（API）:', data);
        metricsDataLoaded = true;
        displayValue('median-estimateCarry', data.median_estimateCarry);
        displayValue('median-impactHeadSpeed', data.median_impactHeadSpeed);
        displayValue('median-impactFaceAngle', data.median_impactFaceAngle);
        const carryUnitEl = document.getElementById('median-estimateCarry');
        const speedUnitEl = document.getElementById('median-impactHeadSpeed');
        const angleUnitEl = document.getElementById('median-impactFaceAngle');
        if(carryUnitEl && carryUnitEl.textContent !== '---') carryUnitEl.textContent += ' yd';
        if(speedUnitEl && speedUnitEl.textContent !== '---') speedUnitEl.textContent += ' m/s';
        if(angleUnitEl && angleUnitEl.textContent !== '---') angleUnitEl.textContent += '°';
      })
      .catch(err => {
        console.error(err);
        metricsDataLoaded = false;
        ['median-estimateCarry', 'median-impactHeadSpeed', 'median-impactFaceAngle'].forEach(id => displayValue(id, null));
      })
  );

  // 詳細指標取得
  initialFetchPromises.push(
    fetch('/api/metrics')
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`Metrics API エラー: ${res.status}`)))
      .then(data => {
        console.log('詳細指標データ受信（API）:', data);
        metricsDataLoaded = true;
        displayValue('metric-clubPath', data.median_impactClubPath);
        displayValue('metric-loftAngle', data.median_impactLoftAngle);
        displayValue('metric-gripSpeed', data.median_maxGripSpeed);
        displayValue('metric-lieAngle', data.median_impactLieAngle);
        displayValue('metric-attackAngle', data.median_impactAttackAngle);
        const clubPathUnitEl = document.getElementById('metric-clubPath');
        const loftUnitEl = document.getElementById('metric-loftAngle');
        const gripUnitEl = document.getElementById('metric-gripSpeed');
        const lieUnitEl = document.getElementById('metric-lieAngle');
        const attackUnitEl = document.getElementById('metric-attackAngle');
        if(clubPathUnitEl && clubPathUnitEl.textContent !== '---') clubPathUnitEl.textContent += '°';
        if(loftUnitEl && loftUnitEl.textContent !== '---') loftUnitEl.textContent += '°';
        if(gripUnitEl && gripUnitEl.textContent !== '---') gripUnitEl.textContent += ' m/s';
        if(lieUnitEl && lieUnitEl.textContent !== '---') lieUnitEl.textContent += '°';
        if(attackUnitEl && attackUnitEl.textContent !== '---') attackUnitEl.textContent += '°';
      })
      .catch(err => {
        console.error(err);
        ['metric-clubPath', 'metric-loftAngle', 'metric-gripSpeed', 'metric-lieAngle', 'metric-attackAngle'].forEach(id => displayValue(id, null));
      })
  );

  // 閾値データ取得
  initialFetchPromises.push(
    fetch('/api/thresholds') // ★★★ 追加 ★★★
      .then(res => {
        if (!res.ok) throw new Error(`閾値APIエラー: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('閾値データ受信:', data ? `${data.length}件` : 'データなし');
        if (Array.isArray(data)) {
            thresholdData = data; // グローバル変数に保存
        } else {
            console.error("受信した閾値データが配列ではありません。");
            thresholdData = []; // 空にしておく
        }
      })
      .catch(err => {
        console.error('閾値データ取得エラー:', err);
        thresholdData = []; // エラー時も空配列
      })
  );

  // --- ③ スイングタイプ選択の初期化 (閾値取得後に行う必要はない) ---
   const swingTypeSelect = document.getElementById('swing-type-select');
   if (swingTypeSelect) {
     try {
       const swingTypes = swingTypeData;
       swingTypeSelect.innerHTML = '';
       swingTypes.forEach(type => {
         const option = document.createElement('option');
         option.value = type.id;
         option.textContent = `Swing type ID ${type.id}：${type.Swing_Type_Name_JP}`;
         if (type.id === 2) option.selected = true;
         swingTypeSelect.appendChild(option);
       });
       const initialTypeId = parseInt(swingTypeSelect.value);
       const initialType = swingTypes.find(type => type.id === initialTypeId);
       if (initialType) displaySwingTypeInfo(initialType);
       swingTypeSelect.addEventListener('change', function() {
         const selectedId = parseInt(this.value);
         const selectedType = swingTypes.find(type => type.id === selectedId);
         if (selectedType) displaySwingTypeInfo(selectedType);
       });
     } catch (error) {
       console.error("スイングタイプ初期化エラー:", error);
     }
   } else {
     console.warn("要素 #swing-type-select が見つかりません。");
   }

  // --- ④ テーブルデータ表示処理 ---
  // 全ての初期API(中央値、詳細指標、閾値)の完了を待ってからテーブル表示
  Promise.allSettled(initialFetchPromises).finally(() => {
     console.log("初期データ取得完了後、テーブルデータを取得します。");
     fetchAndDisplayTableData();
  });

  // --- ⑤ スイング判定ボタンのクリックイベント設定 ---
  const judgeButton = document.getElementById('judge-my-swing-button');
  if (judgeButton) {
    judgeButton.addEventListener('click', async () => {
      console.log('スイング判定ボタンが押されました！ BigQueryからランダムデータ取得開始...');
      const apiUrl = '/api/random-swing';

      judgeButton.disabled = true;
      judgeButton.textContent = '判定中...';
      const judgedTypeNameEl = document.getElementById('judged-swing-type-name');
      const judgedOverviewEl = document.getElementById('judged-swing-overview');
      if(judgedTypeNameEl) judgedTypeNameEl.textContent = 'データを取得・判定中...';
      if(judgedOverviewEl) judgedOverviewEl.textContent = '';
      resetMeasuredValuesDisplay();

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) { /* ... エラー処理 ... */ } // (エラー処理は省略)
        const randomSwingData = await response.json();
        console.log('BigQueryから取得したランダムデータ:', randomSwingData);

        displayMySwingValues(randomSwingData); // 取得したデータを表示

        // ▼▼▼ 判定処理と結果表示を追加 ▼▼▼
        const judgedTypeId = judgeSwingType(randomSwingData, thresholdData); // 判定実行！
        console.log("判定結果のタイプID:", judgedTypeId);

        if (judgedTypeId !== null) {
          const judgedTypeInfo = swingTypeData.find(type => type.id === judgedTypeId);
          displayJudgedSwingType(judgedTypeInfo); // 判定結果を表示
        } else {
          displayJudgedSwingType(null); // 判定不可を表示
        }
        // ▲▲▲ 判定処理と結果表示を追加 ▲▲▲

      } catch (error) {
        /* ... エラー処理 ... */ // (エラー処理は省略)
         if(judgedTypeNameEl) judgedTypeNameEl.textContent = `エラー: ${error.message}`;
        resetMeasuredValuesDisplay();
      } finally {
        judgeButton.disabled = false;
        judgeButton.textContent = 'スイング判定';
      }
    });
  } else {
    console.warn("要素 #judge-my-swing-button が見つかりません。");
  }

}); // DOMContentLoaded の終わり