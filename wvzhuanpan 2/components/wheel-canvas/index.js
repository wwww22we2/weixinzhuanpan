const { computeSpinDelta, snapRotationToIndex } = require('../../utils/wheel.js');

function drawWheel(ctx, width, height, options, colors, rotationDeg, highlightSet) {
  const n = options.length;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  if (!n) {
    ctx.fillStyle = '#ede9ff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#888';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('请至少添加 2 个选项', width / 2, height / 2);
    ctx.restore();
    return;
  }
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 18;
  const slice = (2 * Math.PI) / n;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
  const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ring.addColorStop(0, '#FFE9A8');
  ring.addColorStop(0.5, '#FFC857');
  ring.addColorStop(1, '#FFB347');
  ctx.strokeStyle = ring;
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.restore();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);

  const hs = highlightSet || new Set();

  for (let i = 0; i < n; i++) {
    const start = -Math.PI / 2 + i * slice;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, start, end);
    ctx.closePath();
    const baseFill = i % 2 === 0 ? '#FFFFFF' : '#FFF6E8';
    ctx.fillStyle = hs.has(i) ? '#FFE3BF' : baseFill;
    ctx.fill();
    ctx.strokeStyle = '#F08A24';
    ctx.lineWidth = 3;
    ctx.stroke();

    const mid = start + slice / 2;
    const tr = r * 0.6;
    const tx = Math.cos(mid) * tr;
    const ty = Math.sin(mid) * tr;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(mid + Math.PI / 2);
    const fs = Math.max(12, Math.floor(r / 13));
    ctx.font = `700 ${fs}px sans-serif`;
    ctx.fillStyle = i % 3 === 0 ? '#E64525' : '#A35A0C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxChord = Math.max(14, 2 * tr * Math.sin(slice / 2) * 0.88);
    drawLabel(ctx, options[i], 0, 0, maxChord, fs);
    ctx.restore();
  }

  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(0, 0, 3, 0, 0, r * 0.25);
  g.addColorStop(0, '#FFF4C9');
  g.addColorStop(1, '#FF9F3F');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#F5A623';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 ${Math.max(14, Math.floor(r / 8.5))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GO', 0, 0);
  ctx.restore();

  drawPointer(ctx, cx, cy, r);
}

function drawPointer(ctx, cx, cy, r) {
  const tipY = cy - r + 8;
  const baseY = cy - r * 0.14;
  ctx.save();
  ctx.shadowColor = 'rgba(255, 122, 26, 0.4)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(cx - 18, baseY);
  ctx.lineTo(cx + 18, baseY);
  ctx.closePath();
  ctx.fillStyle = '#FFC35A';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, tipY + 3);
  ctx.lineTo(cx - 12, baseY + 2);
  ctx.lineTo(cx + 12, baseY + 2);
  ctx.closePath();
  ctx.fillStyle = '#FF5A1F';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.05, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE7A3';
  ctx.fill();
  ctx.strokeStyle = '#F5A623';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

function shadeColor(hex, percent) {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `rgb(${r},${g},${b})`;
}

function drawLabel(ctx, text, x, y, maxWidth, lineHeight) {
  const s = String(text || '');
  if (!s) return;
  const lines = [];
  let line = '';
  for (let i = 0; i < s.length; i++) {
    const test = line + s[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = s[i];
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const use = lines.slice(0, 3);
  const startY = y - ((use.length - 1) * lineHeight) / 2;
  use.forEach((ln, idx) => {
    let out = ln;
    if (idx === 2 && lines.length > 3) out += '…';
    ctx.fillText(out, x, startY + idx * lineHeight);
  });
}

Component({
  properties: {
    options: {
      type: Array,
      value: []
    },
    colors: {
      type: Array,
      value: []
    },
    rotation: {
      type: Number,
      value: 0
    },
    highlighted: {
      type: Array,
      value: []
    }
  },
  data: {
    dpr: 2,
    w: 300,
    h: 300,
    pxSize: 300
  },
  lifetimes: {
    attached() {
      const sys = wx.getSystemInfoSync();
      const px = Math.max(200, Math.floor((600 * sys.windowWidth) / 750));
      this.setData({ dpr: sys.pixelRatio || 2, pxSize: px });
    },
    ready() {
      this._canvasReady = false;
      this._ctx = null;
      this._canvas = null;
      this._rotation = 0;
      wx.nextTick(() => this.initCanvas(0));
    }
  },
  observers: {
    'options, colors, highlighted': function () {
      wx.nextTick(() => this.redraw());
    },
    rotation: function (v) {
      if (typeof v === 'number' && !this._animating) {
        this._rotation = v;
        wx.nextTick(() => this.redraw());
      }
    }
  },
  methods: {
    initCanvas(retry) {
      const attempt = typeof retry === 'number' ? retry : 0;
      const sys = wx.getSystemInfoSync();
      const w = Math.max(200, Math.floor((600 * sys.windowWidth) / 750));
      const h = w;
      const dpr = sys.pixelRatio || 2;
      wx.createSelectorQuery()
        .in(this)
        .select('#wheelCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0] || !res[0].node) {
            if (attempt < 30) {
              setTimeout(() => this.initCanvas(attempt + 1), 50);
            }
            return;
          }
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          ctx.scale(dpr, dpr);
          this._canvas = canvas;
          this._ctx = ctx;
          this._canvasReady = true;
          this._rotation = this.data.rotation || 0;
          this.setData({ w, h, dpr, pxSize: w });
          this.redraw();
        });
    },
    redraw() {
      if (!this._canvasReady || !this._ctx) return;
      const options = this.data.options || [];
      const colors = this.data.colors.length ? this.data.colors : ['#cccccc'];
      const hi = (this.data.highlighted || []).reduce((s, i) => {
        s.add(i);
        return s;
      }, new Set());
      const w = this.data.w;
      const h = this.data.h;
      drawWheel(this._ctx, w, h, options, colors, this._rotation, hi);
    },
    spinToIndex(targetIndex, durationMs, cb) {
      const options = this.data.options || [];
      const n = options.length;
      if (!n) return;
      const current = this._rotation || 0;
      const delta = computeSpinDelta(current, targetIndex, n);
      this._animateTo(current + delta, durationMs, () => {
        const snapped = snapRotationToIndex(this._rotation, targetIndex, n);
        this._rotation = snapped;
        this.redraw();
        this.setData({ rotation: snapped });
        if (typeof cb === 'function') cb();
      });
    },
    spinDecor(durationMs, cb) {
      const current = this._rotation || 0;
      const extra = 360 * (5 + Math.floor(Math.random() * 2)) + Math.random() * 360;
      this._animateTo(current + extra, durationMs, cb);
    },
    _animateTo(targetRotation, durationMs, done) {
      const start = this._rotation || 0;
      const end = targetRotation;
      const t0 = Date.now();
      const dur = durationMs || 2800;
      this._animating = true;
      const step = () => {
        const t = Date.now();
        const p = Math.min(1, (t - t0) / dur);
        const ease = 1 - Math.pow(1 - p, 3);
        this._rotation = start + (end - start) * ease;
        this.redraw();
        if (p < 1) {
          if (this._canvas && this._canvas.requestAnimationFrame) {
            this._canvas.requestAnimationFrame(step);
          } else {
            setTimeout(step, 16);
          }
        } else {
          this._rotation = end;
          this.redraw();
          this._animating = false;
          this.setData({ rotation: end });
          if (typeof done === 'function') done();
        }
      };
      if (this._canvas && this._canvas.requestAnimationFrame) {
        this._canvas.requestAnimationFrame(step);
      } else {
        setTimeout(step, 16);
      }
    },
    setRotation(deg) {
      this._rotation = deg;
      this.setData({ rotation: deg });
      this.redraw();
    },
    setHighlighted(indices) {
      this.setData({ highlighted: indices || [] });
    }
  }
});
