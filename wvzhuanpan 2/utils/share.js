const SHARE_MAP = {
  index: {
    title: '随缘转盘 | 解决选择困难，一切随机决策',
    path: '/pages/index/index'
  },
  customWheel: {
    title: '自定义选项，转一下就有答案',
    path: '/pages/custom-wheel/custom-wheel'
  },
  foodWheel: {
    title: '今天吃什么？来转一下美食转盘',
    path: '/pages/food-wheel/food-wheel'
  },
  drinkWheel: {
    title: '喝酒转盘 | 今晚喝法交给随机安排',
    path: '/pages/drink-wheel/drink-wheel'
  },
  coupleHeat: {
    title: '情侣升温 | 3 档 40 格互动棋盘',
    path: '/pages/couple-heat/couple-heat'
  },
  history: {
    title: '随缘转盘 | 帮你快速做决定',
    path: '/pages/index/index'
  },
  settings: {
    title: '随缘转盘 | 轻量随机决策小工具',
    path: '/pages/index/index'
  },
  about: {
    title: '随缘转盘 | 吃什么、选什么，转一下再说',
    path: '/pages/index/index'
  }
};

function getShareConfig(key) {
  return SHARE_MAP[key] || SHARE_MAP.index;
}

function setupShareMenu() {
  try {
    wx.showShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    });
  } catch (e) {}
}

function buildShareAppMessage(key) {
  const config = getShareConfig(key);
  return {
    title: config.title,
    path: config.path
  };
}

function buildShareTimeline(key) {
  const config = getShareConfig(key);
  return {
    title: config.title,
    query: `from=${config.path.replace(/^\//, '')}`
  };
}

module.exports = {
  setupShareMenu,
  buildShareAppMessage,
  buildShareTimeline
};
