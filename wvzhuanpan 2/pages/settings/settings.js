const storage = require('../../utils/storage.js');
const { setupShareMenu, buildShareAppMessage, buildShareTimeline } = require('../../utils/share.js');

Page({
  data: {
    soundOn: true,
    vibrateOn: true
  },
  onLoad() {
    setupShareMenu();
  },
  onShow() {
    const s = storage.getSettings();
    this.setData({
      soundOn: !!s.soundOn,
      vibrateOn: !!s.vibrateOn
    });
  },
  onSound(e) {
    const soundOn = !!e.detail.value;
    storage.saveSettings({ soundOn });
    this.setData({ soundOn });
  },
  onVibrate(e) {
    const vibrateOn = !!e.detail.value;
    storage.saveSettings({ vibrateOn });
    this.setData({ vibrateOn });
  },
  onShareAppMessage() {
    return buildShareAppMessage('settings');
  },
  onShareTimeline() {
    return buildShareTimeline('settings');
  }
});
