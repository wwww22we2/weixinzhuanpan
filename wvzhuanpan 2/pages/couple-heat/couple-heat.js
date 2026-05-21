const { LEVELS } = require('../../data/couple-heat.js');
const { setupShareMenu, buildShareAppMessage, buildShareTimeline } = require('../../utils/share.js');

Page({
  data: {
    levels: LEVELS
  },
  onLoad() {
    setupShareMenu();
  },
  onShareAppMessage() {
    return buildShareAppMessage('coupleHeat');
  },
  onShareTimeline() {
    return buildShareTimeline('coupleHeat');
  }
});
