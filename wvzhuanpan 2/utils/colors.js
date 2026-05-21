/** 系统随机配色：10 种基础色（转盘分区从此池中抽取） */
const PALETTE = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9'
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 为 n 个扇区生成颜色（从 10 色中随机不重复优先，不足则复用） */
function colorsForCount(n) {
  const pool = shuffle(PALETTE);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(pool[i % pool.length]);
  }
  return out;
}

function randomBg() {
  const pool = shuffle(PALETTE);
  return pool[0];
}

module.exports = {
  PALETTE,
  colorsForCount,
  randomBg
};
