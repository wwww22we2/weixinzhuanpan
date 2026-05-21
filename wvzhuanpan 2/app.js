const { loadSettings } = require('./utils/storage.js');

App({
  onLaunch() {
    const sys = wx.getSystemInfoSync();
    this.globalData.SDKVersion = sys.SDKVersion || '';
    this.globalData.platform = sys.platform;
    loadSettings();
  },
  globalData: {
    SDKVersion: '',
    platform: ''
  }
});
