const KEYS = {
  customOptions: 'custom_options',
  customMode: 'custom_mode',
  customMultiCount: 'custom_multi_count',
  templates: 'custom_templates',
  history: 'wheel_history',
  settings: 'app_settings'
};

const DEFAULT_SETTINGS = {
  soundOn: true,
  vibrateOn: true
};

function getSettings() {
  try {
    const raw = wx.getStorageSync(KEYS.settings);
    if (raw && typeof raw === 'object') {
      return { ...DEFAULT_SETTINGS, ...raw };
    }
  } catch (e) {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(partial) {
  const next = { ...getSettings(), ...partial };
  try {
    wx.setStorageSync(KEYS.settings, next);
  } catch (e) {}
  return next;
}

function loadSettings() {
  return getSettings();
}

function getCustomOptions() {
  try {
    const v = wx.getStorageSync(KEYS.customOptions);
    if (Array.isArray(v) && v.length) return v.map(String);
  } catch (e) {}
  return ['选项A', '选项B'];
}

function setCustomOptions(arr) {
  try {
    wx.setStorageSync(KEYS.customOptions, arr);
  } catch (e) {}
}

function getCustomMode() {
  try {
    const m = wx.getStorageSync(KEYS.customMode);
    return m === 'multi' ? 'multi' : 'single';
  } catch (e) {
    return 'single';
  }
}

function setCustomMode(mode) {
  try {
    wx.setStorageSync(KEYS.customMode, mode === 'multi' ? 'multi' : 'single');
  } catch (e) {}
}

function getCustomMultiCount() {
  try {
    const n = wx.getStorageSync(KEYS.customMultiCount);
    const num = parseInt(n, 10);
    if (!isNaN(num) && num >= 2) return num;
  } catch (e) {}
  return 2;
}

function setCustomMultiCount(n) {
  try {
    wx.setStorageSync(KEYS.customMultiCount, n);
  } catch (e) {}
}

function getTemplates() {
  try {
    const v = wx.getStorageSync(KEYS.templates);
    if (Array.isArray(v)) return v;
  } catch (e) {}
  return [];
}

function saveTemplate(name, options) {
  const list = getTemplates().filter((t) => t && t.name !== name);
  list.unshift({
    name,
    options: options.slice(),
    savedAt: Date.now()
  });
  try {
    wx.setStorageSync(KEYS.templates, list.slice(0, 20));
  } catch (e) {}
}

function addHistory(entry) {
  const list = getHistory();
  list.unshift({
    ...entry,
    time: Date.now()
  });
  try {
    wx.setStorageSync(KEYS.history, list.slice(0, 100));
  } catch (e) {}
}

function getHistory() {
  try {
    const v = wx.getStorageSync(KEYS.history);
    if (Array.isArray(v)) return v;
  } catch (e) {}
  return [];
}

function clearHistory() {
  try {
    wx.removeStorageSync(KEYS.history);
  } catch (e) {}
}

module.exports = {
  KEYS,
  getSettings,
  saveSettings,
  loadSettings,
  getCustomOptions,
  setCustomOptions,
  getCustomMode,
  setCustomMode,
  getCustomMultiCount,
  setCustomMultiCount,
  getTemplates,
  saveTemplate,
  addHistory,
  getHistory,
  clearHistory
};
