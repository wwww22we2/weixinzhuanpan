const { setupShareMenu, buildShareAppMessage, buildShareTimeline } = require('../../utils/share.js');

Page({
  onLoad() {
    setupShareMenu();
  },
  onShareAppMessage() {
    return buildShareAppMessage('about');
  },
  onShareTimeline() {
    return buildShareTimeline('about');
  }
});
