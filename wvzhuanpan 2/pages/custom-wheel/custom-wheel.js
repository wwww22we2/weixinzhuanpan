const { colorsForCount } = require('../../utils/colors.js');
const { setupShareMenu, buildShareAppMessage, buildShareTimeline } = require('../../utils/share.js');
const { isBlocked } = require('../../utils/sensitive.js');
const { pickDistinct, randomInt } = require('../../utils/wheel.js');
const storage = require('../../utils/storage.js');

function playFeedback(settings) {
  if (settings.vibrateOn) {
    try {
      wx.vibrateShort({ type: 'medium' });
    } catch (e) {}
  }
  if (settings.soundOn) {
    try {
      const ctx = wx.createInnerAudioContext();
      ctx.src = '/assets/audio/spin.wav';
      ctx.play();
      ctx.onEnded(() => ctx.destroy());
      ctx.onError(() => ctx.destroy());
    } catch (e) {}
  }
}

Page({
  data: {
    contentReady: false,
    draft: '',
    options: ['选项A', '选项B'],
    colors: colorsForCount(2),
    rotation: 0,
    highlighted: [],
    mode: 'single',
    multiCount: 2,
    multiIndex: 0,
    multiRange: ['2'],
    spinning: false
  },
  onLoad() {
    setupShareMenu();
    this.loadState();
  },
  onReady() {
    wx.nextTick(() => {
      setTimeout(() => {
        this.setData({ contentReady: true }, () => {
          const wheel = this.selectComponent('#wheel');
          if (wheel && typeof wheel.redraw === 'function') {
            wx.nextTick(() => wheel.redraw());
          }
        });
      }, 40);
    });
  },
  onShow() {
    this.loadState();
  },
  loadState() {
    let options = storage.getCustomOptions();
    if (!options || options.length < 2) {
      options = ['选项A', '选项B'];
      storage.setCustomOptions(options);
    }
    const mode = storage.getCustomMode();
    let multiCount = storage.getCustomMultiCount();
    const n = options.length;
    if (multiCount > n) multiCount = Math.max(2, n);
    if (multiCount < 2) multiCount = 2;
    storage.setCustomMultiCount(multiCount);
    const multiRange = this.buildMultiRange(n);
    let multiIndex = multiRange.indexOf(String(multiCount));
    if (multiIndex < 0) multiIndex = 0;
    const colors = colorsForCount(n);
    this.setData({
      options,
      colors,
      mode,
      multiCount: parseInt(multiRange[multiIndex], 10),
      multiIndex,
      multiRange,
      highlighted: [],
      draft: ''
    });
  },
  buildMultiRange(n) {
    const arr = [];
    for (let k = 2; k <= n; k++) arr.push(String(k));
    return arr.length ? arr : ['2'];
  },
  onDraft(e) {
    this.setData({ draft: e.detail.value });
  },
  onAdd() {
    const raw = (this.data.draft || '').trim();
    if (!raw) {
      wx.showToast({ title: '请输入有效选项', icon: 'none' });
      return;
    }
    if (raw.length > 10) {
      wx.showToast({ title: '最多10个字', icon: 'none' });
      return;
    }
    if (isBlocked(raw)) {
      wx.showToast({ title: '选项内容违规，请修改', icon: 'none' });
      return;
    }
    if (this.data.options.length >= 20) return;
    const options = this.data.options.concat(raw);
    storage.setCustomOptions(options);
    const n = options.length;
    const multiRange = this.buildMultiRange(n);
    let multiCount = this.data.multiCount;
    if (multiCount > n) multiCount = n;
    const multiIndex = Math.max(0, multiRange.indexOf(String(multiCount)));
    this.setData({
      options,
      colors: colorsForCount(n),
      draft: '',
      multiRange,
      multiCount: parseInt(multiRange[multiIndex], 10),
      multiIndex
    });
  },
  onDelete(e) {
    const i = e.currentTarget.dataset.i;
    const options = this.data.options.slice();
    if (options.length <= 2) {
      wx.showToast({ title: '至少保留2个选项', icon: 'none' });
      return;
    }
    options.splice(i, 1);
    storage.setCustomOptions(options);
    const n = options.length;
    const multiRange = this.buildMultiRange(n);
    let multiCount = this.data.multiCount;
    if (multiCount > n) multiCount = n;
    const multiIndex = Math.max(0, multiRange.indexOf(String(multiCount)));
    storage.setCustomMultiCount(multiCount);
    this.setData({
      options,
      colors: colorsForCount(n),
      multiRange,
      multiCount,
      multiIndex,
      highlighted: []
    });
  },
  onEdit(e) {
    const i = e.currentTarget.dataset.i;
    const cur = this.data.options[i];
    wx.showModal({
      title: '编辑选项',
      editable: true,
      placeholderText: cur,
      content: cur,
      success: (res) => {
        if (!res.confirm) return;
        const next = (res.content !== undefined ? res.content : cur).trim();
        if (!next) {
          wx.showToast({ title: '请输入有效选项', icon: 'none' });
          return;
        }
        if (next.length > 10) {
          wx.showToast({ title: '最多10个字', icon: 'none' });
          return;
        }
        if (isBlocked(next)) {
          wx.showToast({ title: '选项内容违规，请修改', icon: 'none' });
          return;
        }
        const options = this.data.options.slice();
        options[i] = next;
        storage.setCustomOptions(options);
        this.setData({ options });
      }
    });
  },
  onModeChange(e) {
    const mode = e.detail.value === 'multi' ? 'multi' : 'single';
    storage.setCustomMode(mode);
    this.setData({ mode, highlighted: [] });
  },
  onMultiPick(e) {
    const idx = parseInt(e.detail.value, 10);
    const multiCount = parseInt(this.data.multiRange[idx], 10);
    storage.setCustomMultiCount(multiCount);
    this.setData({ multiIndex: idx, multiCount });
  },
  onSpin() {
    const options = this.data.options;
    const n = options.length;
    if (n < 2 || this.data.spinning) return;
    const settings = storage.getSettings();
    const wheel = this.selectComponent('#wheel');
    if (!wheel) return;
    this.setData({ spinning: true, highlighted: [] });

    if (this.data.mode === 'single') {
      const target = randomInt(n);
      playFeedback(settings);
      wheel.spinToIndex(target, 2600, () => {
        const text = options[target];
        wx.showModal({
          title: '结果',
          content: `选中：${text}`,
          showCancel: false
        });
        storage.addHistory({
          type: 'custom',
          mode: 'single',
          result: [text]
        });
        this.setData({ spinning: false, highlighted: [target] });
        setTimeout(() => this.setData({ highlighted: [] }), 2200);
      });
    } else {
      let k = this.data.multiCount;
      if (k < 2) k = 2;
      if (k > n) k = n;
      const indices = pickDistinct(n, k);
      playFeedback(settings);
      wheel.spinDecor(2400, () => {
        const texts = indices.map((i) => options[i]);
        wx.showModal({
          title: '结果',
          content: `选中：${texts.join('、')}`,
          showCancel: false
        });
        storage.addHistory({
          type: 'custom',
          mode: 'multi',
          result: texts
        });
        wheel.setHighlighted(indices);
        this.setData({ spinning: false, highlighted: indices });
        setTimeout(() => {
          wheel.setHighlighted([]);
          this.setData({ highlighted: [] });
        }, 2800);
      });
    }
  },
  onSaveTemplate() {
    const options = this.data.options;
    if (options.length < 2) {
      wx.showToast({ title: '至少2个选项', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '保存模板',
      editable: true,
      placeholderText: '模板名称',
      success: (res) => {
        if (!res.confirm) return;
        const name = (res.content || '').trim() || `模板${Date.now()}`;
        storage.saveTemplate(name, options);
        wx.showToast({ title: '已保存', icon: 'success' });
      }
    });
  },
  onShareAppMessage() {
    return buildShareAppMessage('customWheel');
  },
  onShareTimeline() {
    return buildShareTimeline('customWheel');
  }
});
