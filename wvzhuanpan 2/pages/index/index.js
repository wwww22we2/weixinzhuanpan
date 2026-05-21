const { setupShareMenu, buildShareAppMessage, buildShareTimeline } = require('../../utils/share.js');

// 首页文案与图标：来自 Figma node 1:2（恋爱升温转盘）
Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    navTotalHeight: 64,
    icons: {
      custom: '/assets/index/icon-custom.svg',
      food: '/assets/index/icon-food.svg',
      couple: '/assets/index/icon-couple.svg',
      drink: '/assets/index/icon-drink.svg'
    },
    copy: {
      navTitle: '恋爱升温转盘',
      heroSubtitle: '解决选择困难，一切随机决策',
      cardCustomTitle: '自定义转盘',
      cardCustomDesc: '自定义选项，随心转',
      cardFoodTitle: '美食转盘',
      cardFoodDesc: '美食推荐，不纠结',
      cardCoupleTitle: '情侣升温',
      cardCoupleDesc: '3 档互动棋盘，摇骰子升温',
      cardDrinkTitle: '喝酒转盘',
      cardDrinkDesc: '20 种随机喝法，聚会更有气氛',
      linkHistory: '历史记录',
      linkSettings: '设置',
      linkAbout: '关于我们'
    }
  },
  onLoad() {
    setupShareMenu();
    const windowInfo = wx.getWindowInfo();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = windowInfo.statusBarHeight;
    const navBarHeight =
      (menuButton.top - statusBarHeight) * 2 + menuButton.height;
    this.setData({
      statusBarHeight,
      navBarHeight,
      navTotalHeight: statusBarHeight + navBarHeight
    });
  },
  onShow() {},
  onShareAppMessage() {
    return buildShareAppMessage('index');
  },
  onShareTimeline() {
    return buildShareTimeline('index');
  }
});
