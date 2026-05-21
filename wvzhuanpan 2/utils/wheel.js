/** 从 n 个中无放回随机取 k 个不同下标 */
function pickDistinct(n, k) {
  if (k <= 0 || k > n) return [];
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k).sort((a, b) => a - b);
}

function randomInt(n) {
  return Math.floor(Math.random() * n);
}

/** 根据最终旋转角度（度，顺时针为正）解析指针指向的扇区（扇区 0 从 12 点顺时针） */
function indexFromRotation(rotationDeg, segmentCount) {
  const slice = 360 / segmentCount;
  const norm = ((rotationDeg % 360) + 360) % 360;
  const atTop = (360 - norm) % 360;
  let i = Math.floor(atTop / slice);
  if (i >= segmentCount) i = segmentCount - 1;
  return i;
}

/** 将任意角度对齐到使 targetIndex 停在指针下的角度（保持整圈数不变） */
function snapRotationToIndex(rotationDeg, targetIndex, segmentCount) {
  const slice = 360 / segmentCount;
  const atTop = targetIndex * slice + slice / 2;
  const normTarget = (360 - atTop + 360) % 360;
  const r = ((rotationDeg % 360) + 360) % 360;
  return rotationDeg - r + normTarget;
}

/** 从当前角度再转多少度，可使指针落在 targetIndex（含多圈与小幅随机） */
function computeSpinDelta(currentDeg, targetIndex, segmentCount) {
  const slice = 360 / segmentCount;
  const atTop = targetIndex * slice + slice / 2;
  const normTarget = (360 - atTop + 360) % 360;
  const cur = ((currentDeg % 360) + 360) % 360;
  let delta = (normTarget - cur + 360) % 360;
  delta += 360 * (5 + Math.floor(Math.random() * 3));
  delta += (Math.random() - 0.5) * (slice * 0.5);
  return delta;
}

module.exports = {
  pickDistinct,
  randomInt,
  indexFromRotation,
  computeSpinDelta,
  snapRotationToIndex
};
