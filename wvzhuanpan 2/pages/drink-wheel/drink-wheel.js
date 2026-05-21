const { drinkOptions } = require('../../data/drink.js');
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
    options: drinkOptions,
    colors: colorsForCount(drinkOptions.length),
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
  onSpin() {
    const options = this.data.options;
    const n = options.length;
    if (!n || this.data.spinning) return;
    const settings = storage.getSettings();
    const wheel = this.selectComponent('#wheel');
    if (!wheel) return;
    this.setData({ spinning: true, highlighted: [] });
    const target = randomInt(n);
    playFeedback(settings);
    wheel.spinToIndex(target, 2600, () => {
      const result = options[target];
      wx.showModal({
        title: '今晚就按这个来',
        content: result,
        showCancel: false
      });
      storage.addHistory({
        type: 'drink',
        result: [result]
      });
      this.setData({ spinning: false, highlighted: [target] });
      setTimeout(() => this.setData({ highlighted: [] }), 2200);
    });
  },
  onShareAppMessage() {
    return buildShareAppMessage('drinkWheel');
  },
  onShareTimeline() {
    return buildShareTimeline('drinkWheel');
  }
});
