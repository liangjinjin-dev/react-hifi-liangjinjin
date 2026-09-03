# 最小原型骨架（复制起步）

本目录是自包含的最小 React + Vite 原型起步文件，配合 skill 的字体子集化与多版本构建流程使用。

## 文件
- `index.html` — 入口，含 theme-color / apple-touch-icon / mobile-web-app-capable
- `global.css` — 设计 token（CSS 变量）+ `@font-face`（明朝体子集）+ 移动/PC 导航激活态
- `main.jsx` — HashRouter 最小入口
- `fonts/` — 把 `../fonts/HuiwenMincho.subset.woff2` 复制到这里（或改 `@font-face` 路径）

## 起步
> ⚠ 模板是**平铺结构**：`index.html` 用相对路径引用 `./main.jsx`、`./global.css`，这 4 个文件必须平铺在同一目录（`index.html` / `global.css` / `main.jsx` / `fonts/` 同级），`main.jsx` 里的 `./pages/Home` 也相对该目录解析。**不要**按 Vite 默认 `src/` 结构放置，否则构建报 `Could not resolve "./main.jsx" from "index.html"`。

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install react-router-dom zustand
# 1. 用本目录的 index.html / global.css / main.jsx 平铺覆盖项目根目录
# 2. 把 fonts/ 放到与它们同级
# 3. 在 pages/Home.jsx 建起步页（main.jsx 已 import './pages/Home'）
npm run dev
```

## 字体子集化（首次必做）
```bash
# 1. 抽字：遍历你的 src/ 生成 charset.txt
node ../extract_charset.cjs
# 2. 子集化（pyftsubset 主方案）
bash ../subset_font.sh public/fonts/HuiwenMincho.otf charset.txt assets/fonts/HuiwenMincho.subset.woff2
```
