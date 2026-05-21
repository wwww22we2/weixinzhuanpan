const { cuisines } = require('../../data/food.js');
const { colorsForCount } = require('../../utils/colors.js');
const { setupShareMenu, buildShareAppMessage, buildShareTimeline } = require('../../utils/share.js');
const { randomInt } = require('../../utils/wheel.js');
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
    cuisines,
    activeId: cuisines[0].id,
    dishes: cuisines[0].dishes,
    colors: colorsForCount(cuisines[0].dishes.length),
    rotation: 0,
    highlighted: [],
    spinning: false
  },
  onLoad() {
    setupShareMenu();
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
  onTab(e) {
    const id = e.currentTarget.dataset.id;
    const c = cuisines.find((x) => x.id === id);
    if (!c) return;
    const dishes = c.dishes;
    this.setData({
      activeId: id,
      dishes,
      colors: colorsForCount(dishes.length),
      rotation: 0,
      highlighted: []
    });
    const wheel = this.selectComponent('#wheel');
    if (wheel) wheel.setRotation(0);
  },
  onSpin() {
    const dishes = this.data.dishes;
    const n = dishes.length;
    if (!n || this.data.spinning) return;
    const settings = storage.getSettings();
    const wheel = this.selectComponent('#wheel');
    if (!wheel) return;
    this.setData({ spinning: true, highlighted: [] });
    const target = randomInt(n);
    playFeedback(settings);
    wheel.spinToIndex(target, 2600, () => {
      const name = dishes[target];
      wx.showModal({
        title: '今日推荐',
        content: `今日推荐：${name}`,
        showCancel: false
      });
      storage.addHistory({
        type: 'food',
        cuisine: this.data.activeId,
        result: [name]
      });
      this.setData({ spinning: false, highlighted: [target] });
      setTimeout(() => this.setData({ highlighted: [] }), 2200);
    });
  },
  onShareAppMessage() {
    return buildShareAppMessage('foodWheel');
  },
  onShareTimeline() {
    return buildShareTimeline('foodWheel');
  }
});
