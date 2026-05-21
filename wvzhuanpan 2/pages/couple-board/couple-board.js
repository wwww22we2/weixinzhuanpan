const { getLevelConfig } = require('../../data/couple-heat.js');
const { setupShareMenu } = require('../../utils/share.js');

const BOARD_TOTAL = 40;
const BOARD_COLUMNS = 5;
const CELL_TONES = ['peach', 'violet', 'mint', 'cream'];
const DICE_DOT_MAP = {
  1: ['dot-center'],
  2: ['dot-top-left', 'dot-bottom-right'],
  3: ['dot-top-left', 'dot-center', 'dot-bottom-right'],
  4: ['dot-top-left', 'dot-top-right', 'dot-bottom-left', 'dot-bottom-right'],
  5: ['dot-top-left', 'dot-top-right', 'dot-center', 'dot-bottom-left', 'dot-bottom-right'],
  6: ['dot-top-left', 'dot-middle-left', 'dot-bottom-left', 'dot-top-right', 'dot-middle-right', 'dot-bottom-right']
};

function getDiceDots(face) {
  return DICE_DOT_MAP[face] || DICE_DOT_MAP[1];
}

function buildBoardCells(position) {
  const cells = [];
  const totalRows = Math.ceil(BOARD_TOTAL / BOARD_COLUMNS);

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const row = [];
    const start = rowIndex * BOARD_COLUMNS + 1;
    for (let offset = 0; offset < BOARD_COLUMNS; offset++) {
      const step = start + offset;
      row.push({
        step,
        state: step === position ? 'current' : step < position ? 'passed' : 'pending',
        tone: CELL_TONES[(step - 1) % CELL_TONES.length],
        isStart: step === 1,
        isFinish: step === BOARD_TOTAL
      });
    }
    if (rowIndex % 2 === 1) row.reverse();
    row.forEach((item, index) => {
      const isLastInRow = index === row.length - 1;
      const direction = rowIndex % 2 === 0 ? 'right' : 'left';
      item.connector = item.isFinish ? 'none' : isLastInRow ? 'down' : direction;
      item.rowIndex = rowIndex;
      cells.push(item);
    });
  }

  return cells;
}

Page({
  data: {
    levelKey: 'basic',
    levelName: '',
    levelDesc: '',
    accent: '#8a63ff',
    tasks: [],
    boardCells: buildBoardCells(0),
    position: 0,
    lastDice: 0,
    diceFace: 1,
    diceDots: getDiceDots(1),
    currentTask: '点击下方按钮摇骰子，落点后会弹出对应互动任务。',
    reachedEnd: false,
    rolling: false
  },
  onLoad(options) {
    setupShareMenu();
    const level = getLevelConfig(options.level);
    this.setData({
      levelKey: level.key,
      levelName: level.name,
      levelDesc: level.desc,
      accent: level.accent,
      tasks: level.tasks
    });
  },
  updateBoard(position, extraData) {
    const nextTask =
      position > 0
        ? `第 ${position} 格任务：${this.data.tasks[position - 1]}`
        : '点击下方按钮摇骰子，落点后会弹出对应互动任务。';

    this.setData({
      boardCells: buildBoardCells(position),
      position,
      reachedEnd: position >= BOARD_TOTAL,
      currentTask: nextTask,
      ...(extraData || {})
    });
  },
  onRoll() {
    if (this.data.rolling) return;
    if (this.data.reachedEnd) {
      wx.showToast({ title: '已到终点，请重置', icon: 'none' });
      return;
    }

    const finalDice = Math.floor(Math.random() * 6) + 1;
    let ticks = 0;
    this.setData({ rolling: true });

    const timer = setInterval(() => {
      const face = Math.floor(Math.random() * 6) + 1;
      ticks += 1;
      this.setData({
        lastDice: face,
        diceFace: face,
        diceDots: getDiceDots(face)
      });
      if (ticks >= 6) {
        clearInterval(timer);
        const nextPosition = Math.min(BOARD_TOTAL, this.data.position + finalDice);
        this.updateBoard(nextPosition, {
          lastDice: finalDice,
          diceFace: finalDice,
          diceDots: getDiceDots(finalDice),
          rolling: false
        });
        this.showTaskModal(nextPosition, finalDice);
      }
    }, 90);
  },
  showTaskModal(position, dice) {
    const task = this.data.tasks[position - 1];
    const isEnd = position >= BOARD_TOTAL;

    wx.showModal({
      title: isEnd ? '到达终点' : `骰子点数 ${dice}`,
      content: `第 ${position} 格互动任务：${task}`,
      confirmText: isEnd ? '重新开始' : '知道了',
      cancelText: '稍后',
      showCancel: isEnd,
      success: (res) => {
        if (isEnd && res.confirm) {
          this.resetBoard();
        }
      }
    });
  },
  onPreviewTask(e) {
    const step = Number(e.currentTarget.dataset.step);
    if (!step) return;
    wx.showModal({
      title: `第 ${step} 格`,
      content: this.data.tasks[step - 1],
      showCancel: false
    });
  },
  onReset() {
    wx.showModal({
      title: '重置棋盘',
      content: '确认将当前进度回到起点并重新开始吗？',
      success: (res) => {
        if (!res.confirm) return;
        this.resetBoard();
      }
    });
  },
  resetBoard() {
    this.updateBoard(0, {
      lastDice: 0,
      diceFace: 1,
      diceDots: getDiceDots(1),
      rolling: false
    });
  },
  onShareAppMessage() {
    return {
      title: `${this.data.levelName} | 40 格情侣互动棋盘`,
      path: `/pages/couple-board/couple-board?level=${this.data.levelKey}`
    };
  },
  onShareTimeline() {
    return {
      title: `${this.data.levelName} | 40 格情侣互动棋盘`,
      query: `level=${this.data.levelKey}`
    };
  }
});
