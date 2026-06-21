# Conway's Game of Life | 康威生命游戏仿生实验舱

这是一个基于 **React 19 + TypeScript + Vite + Canvas** 打造的高颜值、可交互、带声音合成系统的康威生命游戏（Conway's Game of Life）仿生实验舱项目。

模拟器不仅提供了基础的演化计算，还集成了视口平移缩放、高保真声音频率合成、多套霓虹主题以及完全开放的规则编辑器，带来兼具学术探索与视听美感的交互体验。

---

## ✨ 核心特色与玩法

### 1. 🎨 多视觉主题（Themes）
内置了四套经过色彩调和的仿生视觉资产：
* 🌌 **赛博霓虹 (Cyberpunk)**：黑蓝色数字底空，点缀电光蓝新生细胞与粉红色成熟细胞，配以荧光粒子拖尾。
* 📟 **绿幕客 (Matrix Retro)**：经典的《黑客帝国》复古终端绿，纯粹的极客像素流动。
* 🔮 **炫光玻态 (Glassmorphism)**：带有磨砂毛玻璃卡片和极光渐变背景的超现代设计。
* 📝 **极简明朗 (Classic Stark)**：纯白背景、深灰细胞与极浅灰色网格线，优雅利落的学术报纸质感。

### 2. 🎵 细胞频率合成器（Audio Synth）
基于浏览器 **Web Audio API** 硬件波形合成：
* 随着模拟的运转，系统会分析网格中的存活细胞密度与生存率，并实时将其映射至**大调五声音阶**。
* 每一步演化都会触发和声及具有回响（Echo）的合成音符，声音的包络与声相随种群活跃度动态起伏。
* 内置一键静音切换。

### 3. 🎮 交互式画布与视口系统
* ⚡ **高性能 60fps 渲染**：利用 HTML5 Canvas 绘制细胞、年龄衰减及运动 trail 轨迹，在大网格下依然保持极佳帧率。
* 🔍 **无冲突滚轮缩放**：采用 Native 级事件监听与 `preventDefault()`，缩放网格时（支持 15% 到 1500% 缩放比例）**完全不会触发浏览器页面的滚动**。
* 🖱️ **自由视口拖拽**：在画布内按住 **鼠标右键/鼠标中键** 并移动，即可任意平移视图。
* 📐 **微调控制栏**：画布右上角内置快捷工具箱，支持 `+ 放大`、`- 缩小` 和 `重置视距`（一键归位并居中）。
* 🎭 **全屏剧场模式**：支持一键将画布铺满屏幕。全屏状态下会自动监听窗口 resize 变化进行弹性重绘，并配备**毛玻璃悬浮操作工具箱**。
* 🖌️ **三种绘制模式**：
  * **激活细胞（Draw）**：左键拖拽激活并点亮像素。
  * **泯灭清除（Erase）**：左键拖拽抹去细胞。
  * **印章模式（Preset Stamp）**：从预设库点选特定结构，在画布移动时会显示该预设的**半透明预览和边界框**，点击左键即可一键盖章放置。

### 4. 🧬 生命演化律法（Custom Ruleset）
* 内置多种生命游戏衍生规则（Conway's B3/S23, Replicator, HighLife, Seeds, Maze, Day & Night, Life Without Death）。
* 开放 **Born（重生）/ Survive（存活）规则矩阵**。支持自由勾选 0~8 个邻居细胞条件，允许探索自创的细胞自动机。

### 5. 📊 实时指征监视器
* 统计数据：当前演化代数（Generations）、活细胞总数（Population）、历史人口极值（Peak）、空间占比（Density）。
* **动态趋势图（Sparkline）**：卡片底端通过 SVG 实时绘制种群数量的运动轨迹，带霓虹渐变填充。

---

## 📂 项目结构

* 🌐 **[index.html](file:///home/hbb/relax/conway/index.html)** - 入口 HTML，配置了页面元信息及 SEO 描述。
* ⚙️ **[vite.config.ts](file:///home/hbb/relax/conway/vite.config.ts)** - Vite 配置文件，强制锁定 `127.0.0.1` 端口。
* 💎 **[src/App.tsx](file:///home/hbb/relax/conway/src/App.tsx)** - 应用的主面板控制器，整合核心渲染、缩放和状态逻辑。
* 🎨 **[src/index.css](file:///home/hbb/relax/conway/src/index.css)** - 主题与卡片样式的核心全局 CSS。
* ⚙️ **[src/types.ts](file:///home/hbb/relax/conway/src/types.ts)** - 包含数据契约和状态定义的类型库。
* 👾 **[src/presets.ts](file:///home/hbb/relax/conway/src/presets.ts)** - 内置的预设结构配置。
* 🎶 **[src/audio.ts](file:///home/hbb/relax/conway/src/audio.ts)** - 基于 Web Audio API 的音频合成模块。
* 🎨 **[src/themes.ts](file:///home/hbb/relax/conway/src/themes.ts)** - 主题配色管理器。

---

## 🛠️ 开始使用

### 环境要求
* [Node.js](https://nodejs.org/) (推荐 LTS v18+)
* npm 或 yarn

### 1. 安装依赖
在项目根目录下，运行以下命令安装所需依赖项：
```bash
npm install
```

### 2. 启动开发服务器
启动本地 IPv4 绑定开发服务：
```bash
npm run dev
```
打开浏览器访问：**[http://127.0.0.1:5173/](http://127.0.0.1:5173/)**。

### 3. 项目打包构建
编译出生产环境优化打包资产：
```bash
npm run build
```
打包产物将输出在 `dist/` 文件夹下。
