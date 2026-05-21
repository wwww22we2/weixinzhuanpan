const storage = require('../../utils/storage.js');
const { cuisines } = require('../../data/food.js');
const { setupShareMenu, buildShareAppMessage, buildShareTimeline } = require('../../utils/share.js');

function formatTime(ts) {
  const d = new Date(ts);
  const p = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes()
  )}`;
}

function summarize(entry) {
  if (entry.type === 'food') {
    const c = cuisines.find((x) => x.id === entry.cuisine);
    const cn = c ? c.name : '';
    return (cn ? `「${cn}」` : '') + (entry.result || []).join('、');
  }
  if (entry.type === 'drink') {
    return (entry.result || []).join('、');
  }
  const r = (entry.result || []).join('、');
  return (entry.mode === 'multi' ? '[多选] ' : '') + r;
}

Page({
  data: {
    list: []
  },
  onLoad() {
    setupShareMenu();
  },
  onShow() {
    this.refresh();
  },
  refresh() {
    const raw = storage.getHistory();
    const list = raw.map((e) => ({
      ...e,
      timeText: formatTime(e.time),
      summary: summarize(e)
    }));
    this.setData({ list });
  },
  onClear() {
    wx.showModal({
      title: '清空历史',
      content: '确定清空全部历史记录吗？',
      success: (res) => {
        if (!res.confirm) return;
        storage.clearHistory();
        this.setData({ list: [] });
        wx.showToast({ title: '已清空', icon: 'none' });
      }
    });
  },
  onShareAppMessage() {
    return buildShareAppMessage('history');
  },
  onShareTimeline() {
    return buildShareTimeline('history');
  }
});
