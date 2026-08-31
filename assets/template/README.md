# 最小原型骨架（复制起步）

本目录是自包含的最小 React + Vite 原型起步文件，配合 skill 的字体子集化与多版本构建流程使用。

## 文件
- `index.html` — 入口，含 theme-color / apple-touch-icon / mobile-web-app-capable
- `global.css` — 设计 token（CSS 变量）+ `@font-face`（明朝体子集）+ 移动/PC 导航激活态
- `main.jsx` — HashRouter 最小入口
- `fonts/` — 把 `../fonts/HuiwenMincho.subset.woff2` 复制到这里（或改 `@font-face` 路径）

## 起步
```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install react-router-dom zustand
# 用本目录的 index.html / global.css / main.jsx 覆盖，并建立 src/pages/Home.jsx
npm run dev
```

## 字体子集化（首次必做）
```bash
# 1. 抽字：遍历你的 src/ 生成 charset.txt
node ../extract_charset.cjs
# 2. 子集化（pyftsubset 主方案）
bash ../subset_font.sh public/fonts/HuiwenMincho.otf charset.txt assets/fonts/HuiwenMincho.subset.woff2
```
