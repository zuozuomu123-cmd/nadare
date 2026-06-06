const REGIONS = {
  hokkaido: {
    name: '北海道',
    center: [43.7, 142.8],
    zoom: 7,
    risk: {
      level: 2,
      label: 'やや高い',
      description: '新雪・風雪による弱層が残存。稜線付近の急斜面では表層雪崩に注意してください。',
      temp: '-5℃', snow: '180cm', newSnow: '+15cm',
    },
    incidents: [
      { lat: 43.67, lng: 142.85, title: '大雪山系 旭岳', date: '2026/02/14', type: '表層雪崩' },
      { lat: 44.10, lng: 142.30, title: '天塩岳周辺',    date: '2026/01/20', type: '表層雪崩' },
    ],
  },
  tohoku: {
    name: '東北',
    center: [39.5, 140.5],
    zoom: 7,
    risk: {
      level: 3,
      label: '高い',
      description: '気温上昇と降雨により表層・全層雪崩の危険が増しています。急斜面への入山は避けてください。',
      temp: '-2℃', snow: '210cm', newSnow: '+8cm',
    },
    incidents: [
      { lat: 38.14, lng: 140.28, title: '蔵王連峰',    date: '2026/02/10', type: '全層雪崩' },
      { lat: 38.55, lng: 139.93, title: '朝日連峰',    date: '2026/01/30', type: '表層雪崩' },
    ],
  },
  joetsu: {
    name: '上越',
    center: [36.9, 138.6],
    zoom: 8,
    risk: {
      level: 3,
      label: '高い',
      description: '連続降雪後に強風が加わり、吹き溜まりで雪庇・スラブが形成されています。',
      temp: '-3℃', snow: '250cm', newSnow: '+20cm',
    },
    incidents: [
      { lat: 36.88, lng: 138.11, title: '妙高山周辺',   date: '2026/01/15', type: '表層雪崩' },
      { lat: 36.80, lng: 138.94, title: '谷川岳周辺',   date: '2026/02/01', type: '表層雪崩' },
    ],
  },
  chubu: {
    name: '中部山岳',
    center: [36.3, 137.7],
    zoom: 8,
    risk: {
      level: 2,
      label: 'やや高い',
      description: '一部の北面急斜面で弱層が残存しています。特に日照が少ない斜面では注意が必要です。',
      temp: '-8℃', snow: '160cm', newSnow: '+5cm',
    },
    incidents: [
      { lat: 36.77, lng: 137.73, title: '北アルプス 栂池周辺', date: '2026/01/28', type: '全層雪崩' },
      { lat: 36.10, lng: 137.55, title: '乗鞍岳周辺',          date: '2026/01/10', type: '表層雪崩' },
    ],
  },
  kinki: {
    name: '近畿',
    center: [34.3, 135.9],
    zoom: 8,
    risk: {
      level: 1,
      label: '低い',
      description: '現時点で大きなリスクはありませんが、積雪のある急斜面では引き続き注意してください。',
      temp: '0℃', snow: '60cm', newSnow: '0cm',
    },
    incidents: [
      { lat: 34.17, lng: 135.76, title: '大峰山脈 八経ヶ岳付近', date: '2026/01/05', type: '表層雪崩' },
    ],
  },
};

const RISK_COLORS = {
  1: '#22c55e',
  2: '#eab308',
  3: '#f97316',
  4: '#ef4444',
  5: '#1f2937',
};

let map;
let markersLayer;

function markerIcon(level) {
  const color = RISK_COLORS[level] || '#94a3b8';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.3);
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function selectRegion(key) {
  const region = REGIONS[key];
  if (!region) return;

  map.flyTo(region.center, region.zoom, { duration: 0.7 });

  markersLayer.clearLayers();
  region.incidents.forEach(inc => {
    L.marker([inc.lat, inc.lng], { icon: markerIcon(region.risk.level) })
      .bindPopup(
        `<div style="font-family:'Hiragino Kaku Gothic ProN','Meiryo',sans-serif;min-width:140px;">
          <div style="font-weight:700;margin-bottom:4px;">${inc.title}</div>
          <div style="font-size:.8em;color:#666;">${inc.date}　${inc.type}</div>
        </div>`
      )
      .addTo(markersLayer);
  });

  const { risk, name } = region;

  document.getElementById('risk-region-name').textContent = name;
  document.getElementById('risk-num').textContent = risk.level;
  document.getElementById('risk-label').textContent = risk.label;
  document.getElementById('risk-badge').className = `risk-badge level-${risk.level}`;
  document.getElementById('risk-description').textContent = risk.description;
  document.getElementById('risk-temp').textContent = risk.temp;
  document.getElementById('risk-snow').textContent = risk.snow;
  document.getElementById('risk-newsnow').textContent = risk.newSnow;

  document.querySelectorAll('.scale-seg').forEach(el => {
    const lvl = parseInt(el.dataset.level, 10);
    el.className = `scale-seg seg-${lvl}${lvl === risk.level ? ' active' : ''}`;
  });

  document.querySelectorAll('.region-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === key);
  });
}

function init() {
  map = L.map('leaflet-map', {
    center: [37.5, 138.0],
    zoom: 5,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  document.querySelectorAll('.region-btn').forEach(btn => {
    btn.addEventListener('click', () => selectRegion(btn.dataset.region));
  });

  selectRegion('hokkaido');
}

init();
