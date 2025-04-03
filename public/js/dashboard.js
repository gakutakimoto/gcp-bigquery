// データを取得して表示する関数
async function fetchAndDisplayData() {
  try {
    console.log('Fetching data...');
    const response = await fetch('/api/data');
    console.log('Response:', response);
    const data = await response.json();
    console.log('Data received:', data);
    
    // 現在の日付を表示
    updateDate();
    
    // データが空でないか確認
    if (!data || data.length === 0) {
      console.log('No data available or empty array');
      return;
    }
    
    // 平均値を計算して表示
    calculateAverages(data);
    
    // テーブルにデータを表示
    displayDataTable(data);
    
    // グラフにデータを表示
    displayBarChart(data);
    
    // 相関グラフを表示
    displayCorrelationChart(data);
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// 日付を更新
function updateDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('update-date').textContent = now.toLocaleDateString('en-US', options);
}

// 平均値を計算
function calculateAverages(data) {
  console.log('Calculating averages from data:', data);
  
  if (!data || data.length === 0) {
    console.log('No data for averages');
    return;
  }
  
  const avgHeadSpeed = data.reduce((sum, row) => sum + row.impactHeadSpeed, 0) / data.length;
  const avgFaceAngle = data.reduce((sum, row) => sum + row.impactFaceAngle, 0) / data.length;
  const avgCarry = data.reduce((sum, row) => sum + row.estimateCarry, 0) / data.length;
  
  console.log('Average values:', {avgHeadSpeed, avgFaceAngle, avgCarry});
  
  document.getElementById('avg-head-speed').textContent = avgHeadSpeed.toFixed(1);
  document.getElementById('avg-face-angle').textContent = avgFaceAngle.toFixed(1);
  document.getElementById('avg-carry').textContent = avgCarry.toFixed(1);
}

// テーブルにデータを表示する関数
function displayDataTable(data) {
  console.log('Displaying table with data:', data);
  
  if (!data || data.length === 0) {
    console.log('No data for table');
    return;
  }
  
  const tableBody = document.getElementById('data-table-body');
  if (!tableBody) {
    console.error('Table body element not found!');
    return;
  }
  
  tableBody.innerHTML = '';
  
  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${row.impactHeadSpeed.toFixed(1)}</td>
      <td>${row.impactFaceAngle.toFixed(1)}</td>
      <td>${row.impactAttackAngle.toFixed(1)}</td>
      <td>${row.estimateCarry.toFixed(1)}</td>
    `;
    
    tableBody.appendChild(tr);
  });
}

// バーチャートを表示する関数
function displayBarChart(data) {
  console.log('Creating bar chart with data:', data);
  
  if (!data || data.length === 0) {
    console.log('No data for bar chart');
    return;
  }
  
  const ctx = document.getElementById('swing-chart');
  if (!ctx) {
    console.error('Swing chart canvas element not found!');
    return;
  }
  
  // データの準備
  const labels = data.map((_, index) => `Swing ${index + 1}`);
  const headSpeedData = data.map(row => row.impactHeadSpeed);
  const faceAngleData = data.map(row => row.impactFaceAngle);
  const attackAngleData = data.map(row => row.impactAttackAngle);
  
  // チャート設定
  if (window.barChart) {
    window.barChart.destroy();
  }
  
  window.barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Head Speed',
          data: headSpeedData,
          backgroundColor: 'rgba(64, 128, 255, 0.7)',
          borderColor: 'rgba(64, 128, 255, 1)',
          borderWidth: 1
        },
        {
          label: 'Face Angle',
          data: faceAngleData,
          backgroundColor: 'rgba(72, 187, 120, 0.7)',
          borderColor: 'rgba(72, 187, 120, 1)',
          borderWidth: 1
        },
        {
          label: 'Attack Angle',
          data: attackAngleData,
          backgroundColor: 'rgba(246, 173, 85, 0.7)',
          borderColor: 'rgba(246, 173, 85, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#8d93a1',
            font: {
              family: "'Oswald', sans-serif",
              size: 11
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#8d93a1',
            font: {
              family: "'Oswald', sans-serif",
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#8d93a1',
            font: {
              family: "'Oswald', sans-serif",
              size: 11
            }
          }
        }
      }
    }
  });
}

// 相関チャートを表示する関数
function displayCorrelationChart(data) {
  console.log('Creating correlation chart with data:', data);
  
  if (!data || data.length === 0) {
    console.log('No data for correlation chart');
    return;
  }
  
  const ctx = document.getElementById('correlation-chart');
  if (!ctx) {
    console.error('Correlation chart canvas element not found!');
    return;
  }
  
  if (window.scatterChart) {
    window.scatterChart.destroy();
  }
  
  window.scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Head Speed vs Carry',
        data: data.map(row => ({
          x: row.impactHeadSpeed,
          y: row.estimateCarry
        })),
        backgroundColor: 'rgba(64, 128, 255, 0.7)',
        borderColor: 'rgba(64, 128, 255, 1)',
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#8d93a1',
            font: {
              family: "'Oswald', sans-serif",
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Head Speed: ${context.parsed.x.toFixed(1)}, Carry: ${context.parsed.y.toFixed(1)}`;
            }
          }
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Carry Distance (yards)',
            color: '#8d93a1',
            font: {
              family: "'Oswald', sans-serif",
              size: 11
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#8d93a1',
            font: {
              family: "'Oswald', sans-serif",
              size: 11
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Head Speed (mph)',
            color: '#8d93a1',
            font: {
              family: "'Oswald', sans-serif",
              size: 11
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#8d93a1',
            font: {
              family: "'Oswald', sans-serif",
              size: 11
            }
          }
        }
      }
    }
  });
}

// ページロード時にデータを取得して表示
document.addEventListener('DOMContentLoaded', fetchAndDisplayData);

// Refresh ボタンのイベントリスナー
const refreshButton = document.getElementById('refresh-data');
if (refreshButton) {
  refreshButton.addEventListener('click', fetchAndDisplayData);
}