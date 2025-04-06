// グローバル変数とサンプルデータ定義
let allSwingData = [];
let currentPage = 1;
const rowsPerPage = 8;
let metricsDataLoaded = false; // メトリクスデータが読み込まれたかのフラグ

// スイングタイプデータ（BigQueryから取得するまでの仮データ）
const swingTypeData = [
  {
    id: 0,
    Club_Type: "ドライバー",
    Swing_Type_Name: "Out-In Power",
    Swing_Type_Name_JP: "アウトイン・パワーフォーム型",
    Overview: "パワフルなスイングで球の飛距離を重視。アウトインの軌道で力強く振り抜く。",
    impactClubPath: -7.2,
    impactAttackAngle: 2.8,
    impactHeadSpeed: 41.5,
    impactFaceAngle: -4.6,
    estimateCarry: 238.4
  },
  {
    id: 1,
    Club_Type: "ドライバー",
    Swing_Type_Name: "Out-In Compact",
    Swing_Type_Name_JP: "アウトイン・コンパクトフォーム型",
    Overview: "コンパクトなスイングでコントロール重視。アウトインの軌道で正確性を高める。",
    impactClubPath: -5.4,
    impactAttackAngle: 1.3,
    impactHeadSpeed: 35.2,
    impactFaceAngle: -3.2,
    estimateCarry: 182.6
  },
  {
    id: 2,
    Club_Type: "ドライバー",
    Swing_Type_Name: "Flexible Inside-Out",
    Swing_Type_Name_JP: "インアウト・フレキシブルフォーム型",
    Overview: "柔軟なフォームでスイング軌道に変化があり、状況対応力が高いスタイル。",
    impactClubPath: 9.052126,
    impactAttackAngle: -0.05148,
    impactHeadSpeed: 38.87136,
    impactFaceAngle: 8.290537,
    estimateCarry: 206.0587
  },
  {
    id: 3,
    Club_Type: "ドライバー",
    Swing_Type_Name: "Inside-Out Power",
    Swing_Type_Name_JP: "インアウト・パワーフォーム型",
    Overview: "インアウトの軌道でパワーを活かしたスイング。ドローボールを打ちやすいスタイル。",
    impactClubPath: 8.5,
    impactAttackAngle: 1.9,
    impactHeadSpeed: 40.2,
    impactFaceAngle: 5.3,
    estimateCarry: 228.7
  },
  {
    id: 4,
    Club_Type: "ドライバー",
    Swing_Type_Name: "Inside-Out Standard",
    Swing_Type_Name_JP: "インアウト・スタンダードフォーム型",
    Overview: "バランスのとれたフォームでインアウト軌道を実現。安定感のあるスイング。",
    impactClubPath: 6.8,
    impactAttackAngle: 1.2,
    impactHeadSpeed: 37.5,
    impactFaceAngle: 4.1,
    estimateCarry: 196.3
  },
  {
    id: 5,
    Club_Type: "アイアン",
    Swing_Type_Name: "Out-In Standard",
    Swing_Type_Name_JP: "アウトイン・スタンダードフォーム型",
    Overview: "安定したスイングフォームでアウトイン軌道を作る。コントロールとパワーのバランスを重視。",
    impactClubPath: -6.3,
    impactAttackAngle: 2.1,
    impactHeadSpeed: 38.1,
    impactFaceAngle: -3.8,
    estimateCarry: 201.8
  },
  {
    id: 6,
    Club_Type: "アイアン",
    Swing_Type_Name: "Square Power",
    Swing_Type_Name_JP: "スクエア・パワーフォーム型",
    Overview: "スクエアな軌道でパワフルに振り抜くスタイル。直進性の高いボールが特徴。",
    impactClubPath: 0.8,
    impactAttackAngle: 3.2,
    impactHeadSpeed: 39.8,
    impactFaceAngle: 0.6,
    estimateCarry: 216.4
  },
  {
    id: 7,
    Club_Type: "アイアン",
    Swing_Type_Name: "Square Compact",
    Swing_Type_Name_JP: "スクエア・コンパクトフォーム型",
    Overview: "コンパクトでスクエアな軌道を作るスイング。安定感と再現性に優れる。",
    impactClubPath: 0.3,
    impactAttackAngle: 2.7,
    impactHeadSpeed: 34.6,
    impactFaceAngle: 0.2,
    estimateCarry: 176.5
  },
  {
    id: 8,
    Club_Type: "アイアン",
    Swing_Type_Name: "Straight Power",
    Swing_Type_Name_JP: "ストレート・パワーフォーム型",
    Overview: "真っすぐなスイング軌道でパワーを最大化。シンプルかつ効果的なスイング。",
    impactClubPath: 1.2,
    impactAttackAngle: 3.6,
    impactHeadSpeed: 40.5,
    impactFaceAngle: 1.1,
    estimateCarry: 220.3
  },
  {
    id: 9,
    Club_Type: "アイアン",
    Swing_Type_Name: "Straight Compact",
    Swing_Type_Name_JP: "ストレート・コンパクトフォーム型",
    Overview: "コンパクトで真っすぐなスイング軌道。再現性と正確性に優れたスタイル。",
    impactClubPath: 0.9,
    impactAttackAngle: 2.4,
    impactHeadSpeed: 33.8,
    impactFaceAngle: 0.7,
    estimateCarry: 172.1
  }
];

// データを取得して表示する関数（テーブル用のみ）
async function fetchAndDisplayData() {
  try {
    console.log('データ取得中...');
    const response = await fetch('/api/data');
    console.log('レスポンス:', response);
    const data = await response.json();
    console.log('データ受信:', data);

    updateDate();

    if (!data || data.length === 0) {
      console.log('データがないか空の配列です');
      return;
    }

    // テーブルデータとして保存
    const useData = data.length > 0 ? data : sampleData;
    allSwingData = useData;

    // テーブルとページネーションの更新のみ行う
    renderTableRows(useData, currentPage, rowsPerPage);
    renderPaginationControls(useData, rowsPerPage);
    
    // メトリクスデータが読み込まれていない場合のみ、テーブルデータからメトリクスを計算
    if (!metricsDataLoaded) {
      displayMainMetrics(useData);
      displayDetailedMetrics(useData);
    }
  } catch (error) {
    console.error('データ取得エラー:', error);
    // エラー時はサンプルデータを使用（テーブル表示のみ）
    allSwingData = sampleData;
    renderTableRows(sampleData, currentPage, rowsPerPage);
    renderPaginationControls(sampleData, rowsPerPage);
    
    // メトリクスデータが読み込まれていない場合のみ、サンプルデータからメトリクスを計算
    if (!metricsDataLoaded) {
      displayMainMetrics(sampleData);
      displayDetailedMetrics(sampleData);
    }
  }
}

// 日付を更新
function updateDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const dateElement = document.getElementById('update-date');
  if (dateElement) {
    dateElement.textContent = `${year}年${month}月`;
  }
}

// メインメトリクスを表示（ローカル計算用、APIデータがない場合のフォールバック）
function displayMainMetrics(data) {
  if (!data || data.length === 0 || metricsDataLoaded) return;
  
  console.log('ローカルデータからメインメトリクスを計算');
  const getMedian = (arr, key) => {
    const sorted = [...arr].sort((a, b) => a[key] - b[key]);
    const mid = Math.floor(sorted.length / 2);
    return sorted[mid][key];
  };
  const medianCarry = getMedian(data, 'estimateCarry');
  const medianHeadSpeed = getMedian(data, 'impactHeadSpeed');
  const medianFaceAngle = getMedian(data, 'impactFaceAngle');

  const estimateCarryEl = document.querySelector('[data-type="estimateCarry"]');
  const impactHeadSpeedEl = document.querySelector('[data-type="impactHeadSpeed"]');
  const impactFaceAngleEl = document.querySelector('[data-type="impactFaceAngle"]');
  
  if (estimateCarryEl) {
    estimateCarryEl.textContent = medianCarry.toFixed(1);
  }
  if (impactHeadSpeedEl) {
    impactHeadSpeedEl.textContent = medianHeadSpeed.toFixed(1) + 'm/s';
  }
  if (impactFaceAngleEl) {
    impactFaceAngleEl.textContent = medianFaceAngle.toFixed(1) + '°';
  }
}

// 詳細メトリクスを表示（ローカル計算用、APIデータがない場合のフォールバック）
function displayDetailedMetrics(data) {
  if (!data || data.length === 0 || metricsDataLoaded) return;
  
  console.log('ローカルデータから詳細メトリクスを計算');
  const midIdx = Math.floor(data.length / 2);
  
  // 安全にプロパティを取得するヘルパー関数
  const getSorted = (key) => {
    if (data.some(item => item[key] !== undefined)) {
      return [...data].sort((a, b) => a[key] - b[key])[midIdx][key];
    }
    return 0;
  };

  const medianClubPath = getSorted('impactClubPath');
  const medianLoftAngle = getSorted('impactLoftAngle') || 0;
  const medianGripSpeed = getSorted('impactGripSpeed') || 0;
  const medianLieAngle = getSorted('impactLieAngle') || 0;
  const medianAttackAngle = getSorted('impactAttackAngle');

  const clubPathEl = document.querySelector('[data-type="impactClubPath"]');
  const loftAngleEl = document.querySelector('[data-type="impactLoftAngle"]');
  const gripSpeedEl = document.querySelector('[data-type="maxGripSpeed"]');
  const lieAngleEl = document.querySelector('[data-type="impactLieAngle"]');
  const attackAngleEl = document.querySelector('[data-type="impactAttackAngle"]');
  
  if (clubPathEl) {
    clubPathEl.textContent = medianClubPath.toFixed(1);
  }
  if (loftAngleEl) {
    loftAngleEl.textContent = medianLoftAngle.toFixed(1) + '°';
  }
  if (gripSpeedEl) {
    gripSpeedEl.textContent = medianGripSpeed.toFixed(1) + 'm/s';
  }
  if (lieAngleEl) {
    lieAngleEl.textContent = medianLieAngle.toFixed(1) + '°';
  }
  if (attackAngleEl) {
    attackAngleEl.textContent = medianAttackAngle.toFixed(1) + '°';
  }
}

// テーブル行を表示
function renderTableRows(data, page = 1, rowsPerPage = 8) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const visibleRows = data.slice(start, end);

  const tbody = document.getElementById('data-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';

  visibleRows.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${start + i + 1}</td>
      <td>${row.impactHeadSpeed.toFixed(6)}</td>
      <td>${row.impactClubPath.toFixed(6)}</td>
      <td>${row.impactFaceAngle.toFixed(6)}</td>
      <td>${row.impactAttackAngle.toFixed(6)}</td>
      <td>${row.estimateCarry.toFixed(5)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ページネーション表示（改良版）
function renderPaginationControls(data, rowsPerPage = 8) {
  const pageCount = Math.ceil(data.length / rowsPerPage);
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  pagination.innerHTML = '';
  
  // 表示する最大ボタン数を制限（5個まで）
  const maxVisibleButtons = 5;
  
  // 前へボタンの追加
  if (pageCount > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn nav-btn';
    prevBtn.textContent = '←';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTableRows(data, currentPage, rowsPerPage);
        renderPaginationControls(data, rowsPerPage);
      }
    });
    pagination.appendChild(prevBtn);
  }

  // ページボタンの表示範囲を計算
  let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
  let endPage = Math.min(pageCount, startPage + maxVisibleButtons - 1);
  
  // 開始ページの調整
  if (endPage - startPage + 1 < maxVisibleButtons) {
    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
  }

  // ページボタンの生成
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      renderTableRows(data, currentPage, rowsPerPage);
      renderPaginationControls(data, rowsPerPage);
    });
    pagination.appendChild(btn);
  }
  
  // 次へボタンの追加
  if (pageCount > 1) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn nav-btn';
    nextBtn.textContent = '→';
    nextBtn.disabled = currentPage === pageCount;
    nextBtn.addEventListener('click', () => {
      if (currentPage < pageCount) {
        currentPage++;
        renderTableRows(data, currentPage, rowsPerPage);
        renderPaginationControls(data, rowsPerPage);
      }
    });
    pagination.appendChild(nextBtn);
  }
}

// スイングタイプデータをBigQueryから取得する関数
async function fetchSwingTypeData() {
  try {
    const response = await fetch('/api/swing-types');
    if (!response.ok) {
      throw new Error('スイングタイプデータの取得に失敗しました');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('スイングタイプデータ取得エラー:', error);
    // エラー時は事前定義したデータを使用
    return swingTypeData;
  }
}

// 選択されたスイングタイプの情報を表示する関数
function displaySwingTypeInfo(swingType) {
  // アニメーション用のクラスを付与・削除する関数
  const animateElement = (element) => {
    if (!element) return;
    
    // 一度フェードアウト
    element.classList.add('fade-out');
    
    // 少し待ってから新しい値を設定し、フェードイン
    setTimeout(() => {
      // 各要素のデータを更新
      if (element.id === 'swing-type-name') element.textContent = swingType.Swing_Type_Name;
      if (element.id === 'club-type') element.textContent = swingType.Club_Type;
      if (element.id === 'cluster-name-jp') element.textContent = swingType.Swing_Type_Name_JP;
      if (element.id === 'swing-overview') element.textContent = swingType.Overview;
      if (element.id === 'type-estimateCarry') element.textContent = swingType.estimateCarry.toFixed(2)+ "yd";
      if (element.id === 'type-impactHeadSpeed') element.textContent = swingType.impactHeadSpeed.toFixed(2)+ "m/s";
      if (element.id === 'type-impactFaceAngle') element.textContent = swingType.impactFaceAngle.toFixed(2)+ "°";
      if (element.id === 'type-impactClubPath') element.textContent = swingType.impactClubPath.toFixed(2)+ "°";
      if (element.id === 'type-impactAttackAngle') element.textContent = swingType.impactAttackAngle.toFixed(2)+ "°";
      
      // フェードアウトを解除
      element.classList.remove('fade-out');
      // フェードインのためのクラスを追加
      element.classList.add('fade-in');
      
      // アニメーション終了後にクラスを削除
      setTimeout(() => {
        element.classList.remove('fade-in');
      }, 500);
    }, 300);
  };
  
  // 各要素をアニメーションで更新
  const elementsToAnimate = [
    document.getElementById('swing-type-name'),
    document.getElementById('club-type'),
    document.getElementById('cluster-name-jp'),
    document.getElementById('swing-overview'),
    document.getElementById('type-estimateCarry'),
    document.getElementById('type-impactHeadSpeed'),
    document.getElementById('type-impactFaceAngle'),
    document.getElementById('type-impactClubPath'),
    document.getElementById('type-impactAttackAngle')
  ];
  
  // すべての要素にアニメーション効果を適用
  elementsToAnimate.forEach(element => {
    if (element) animateElement(element);
  });
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM読み込み完了、データ取得開始');
  
  // APIからメイン指標の中央値を取得（優先）
  fetch('/api/median')
    .then(res => res.json())
    .then(data => {
      console.log('メイン指標データ受信（API）:', data);
      metricsDataLoaded = true; // APIからのデータ取得を記録
      
      const estimateCarryEl = document.querySelector('[data-type="estimateCarry"]');
      const impactHeadSpeedEl = document.querySelector('[data-type="impactHeadSpeed"]');
      const impactFaceAngleEl = document.querySelector('[data-type="impactFaceAngle"]');
      
      if (estimateCarryEl) {
estimateCarryEl.textContent = data.median_estimateCarry != null
  ? data.median_estimateCarry.toFixed(1) + 'yd'
  : '--';      }
      if (impactHeadSpeedEl) {
        impactHeadSpeedEl.textContent = (data.median_impactHeadSpeed?.toFixed(1) ?? '--') + 'm/s';
      }
      if (impactFaceAngleEl) {
        impactFaceAngleEl.textContent = (data.median_impactFaceAngle?.toFixed(1) ?? '--') + '°';
      }
    })
    .catch(err => {
      console.error('中央値取得エラー:', err);
      metricsDataLoaded = false; // エラー時はフラグをリセット
    });

  // APIから詳細指標の中央値を取得（優先）
  fetch('/api/metrics')
    .then(res => res.json())
    .then(data => {
      console.log('詳細指標データ受信（API）:', data);
      metricsDataLoaded = true; // APIからのデータ取得を記録
      
      const clubPathEl = document.querySelector('[data-type="impactClubPath"]');
      const loftAngleEl = document.querySelector('[data-type="impactLoftAngle"]');
      const gripSpeedEl = document.querySelector('[data-type="maxGripSpeed"]');
      const lieAngleEl = document.querySelector('[data-type="impactLieAngle"]');
      const attackAngleEl = document.querySelector('[data-type="impactAttackAngle"]');
      
      if (clubPathEl) {
        clubPathEl.textContent = data.median_impactClubPath?.toFixed(1) ?? '--';
      }
      if (loftAngleEl) {
        loftAngleEl.textContent = (data.median_impactLoftAngle?.toFixed(1) ?? '--') + '°';
      }
      if (gripSpeedEl) {
        gripSpeedEl.textContent = (data.median_maxGripSpeed?.toFixed(1) ?? '--') + 'm/s';
      }
      if (lieAngleEl) {
        lieAngleEl.textContent = (data.median_impactLieAngle?.toFixed(1) ?? '--') + '°';
      }
      if (attackAngleEl) {
        attackAngleEl.textContent = (data.median_impactAttackAngle?.toFixed(1) ?? '--') + '°';
      }
    })
    .catch(err => {
      console.error('詳細指標取得エラー:', err);
      metricsDataLoaded = false; // エラー時はフラグをリセット
    });

  // スイングタイプ選択要素を取得
  const swingTypeSelect = document.getElementById('swing-type-select');
  if (swingTypeSelect) {
    // スイングタイプデータを取得
    const swingTypes = await fetchSwingTypeData();
    
    // 初期表示（デフォルトでcluster ID 2を選択）
    const initialType = swingTypes.find(type => type.id === 2) || swingTypes[0];
    displaySwingTypeInfo(initialType);
    
    // 選択変更イベントを設定
    swingTypeSelect.addEventListener('change', function() {
      const selectedId = parseInt(this.value);
      const selectedType = swingTypes.find(type => type.id === selectedId);
      if (selectedType) {
        displaySwingTypeInfo(selectedType);
      }
    });
  }

  // データテーブル用のデータを取得（APIからのメトリクス取得後）
  // 少し遅延を入れてAPIからのメトリクス表示を優先
  setTimeout(() => {
    fetchAndDisplayData();
  }, 100);
});