/** 简易本地校验（上架后仍需遵守平台内容规范） */
const BLOCK = [
  '法轮',
  '赌博',
  '色情',
  '暴力',
  '毒品',
  '台独',
  '港独'
];

function isBlocked(text) {
  if (!text || typeof text !== 'string') return true;
  const t = text.trim();
  if (!t) return true;
  for (let i = 0; i < BLOCK.length; i++) {
    if (t.indexOf(BLOCK[i]) !== -1) return true;
  }
  return false;
}

module.exports = {
  isBlocked
};
