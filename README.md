# 欧欧太空学习冒险 (KSP Math Course)

一款面向中国小学生(1-6年级)的太空主题教育答题应用，覆盖**语文、数学、英语、天文**四科，基于人教版教材体系。

## 功能特性

- **年级课程体系** -- 1-6年级，每科按学期划分，跟随人教版教材目录
- **多种题型** -- 选择题、填空题、判断题、多空填空
- **30秒限时答题** -- 倒计时提醒音效，超时自动跳过
- **积分奖励系统** -- 答对得分，连对加速，速答加分，全对额外奖励
- **积分兑换商城** -- 30+ 实物奖品，用积分兑换
- **错题本** -- 自动收录错题，答对自动移除，支持按科目筛选
- **音效系统** -- Web Audio API 生成，无需外部音频文件
- **深色/浅色主题** -- 一键切换，自动保存
- **答题进度记忆** -- 中途退出可恢复
- **拓展专区** -- 奥数(7级)、数独、思维训练、唐诗、汉字游戏、科学百科

## 技术栈

- HTML5 + CSS3 + 原生 JavaScript (无框架依赖)
- Capacitor 封装为 Android APK
- 全部数据存储在 localStorage

## 快速开始

### 网页版

直接用浏览器打开 `index.html` 即可，无需任何构建步骤。

### 生成题目模块

```bash
node scripts/generate-modules.js
```

### 构建 Android APK

```bash
npm install
npx cap sync
cd android && ./gradlew assembleDebug
```

## 项目结构

```
├── index.html          # 主页面（年级选择）
├── engine.js           # 答题引擎核心
├── audio.js            # 音效系统
├── points.js           # 积分系统
├── timer.js            # 计时器
├── theme.js            # 主题切换
├── wrongbook.js/html   # 错题本
├── shop.html/js        # 积分商城
├── styles.css          # 答题页样式
├── grade-styles.css    # 年级页样式
├── subj-styles.css     # 科目页样式
├── data/               # 题库数据
│   ├── module-registry.js
│   ├── qb-math-g*.js
│   ├── qb-chinese-g*.js
│   ├── qb-english-g*.js
│   └── qb-astro-g*.js
├── g1/ ~ g6/           # 各年级课程页面
├── expand/             # 拓展专区
│   ├── aoshu/          # 奥数
│   ├── shudu/          # 数独
│   ├── siwei/          # 思维训练
│   ├── tangshi/        # 唐诗
│   ├── hanzi/          # 汉字游戏
│   └── like/           # 科学百科
└── scripts/            # 构建工具
```

## 主题风格

太空探索主题 UI，星空背景，火箭/行星图标，吉祥物为绿色外星人 Jebediah。

## License

MIT
