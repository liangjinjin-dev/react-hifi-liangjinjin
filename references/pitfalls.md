# 踩坑记录（Pitfalls）

## 1. 字蛛 font-spider 崩溃
- 现象：node 22 下 `font-spider@1.3.5` 处理 24MB otf 时 `exit 137`（SIGKILL），fonteditor-core 不兼容 / OOM
- 解决：改用等价同源工具 `pyftsubset`（fonttools 4.63.0，venv 已装）
- 命令见 `scripts/subset_font.sh`
- 若用户坚持字蛛：先在小字体验证，失败即降级 pyftsubset

## 2. React #299 Invalid hook call（XHS 构建）
- 现象：Vite ESM→IIFE 构建会让 react-dom/client 触发 "Invalid hook call"（renderer 不设 hook dispatcher）
- 解决：XHS 离线小工具必须用 **esbuild 直接 bundle（`--format=iife`）**，不用 Vite
- 构建脚本：`scripts/build_xhs.cjs`

## 3. XHS 离线小工具 ≤10MB 约束
- 格式：离线 H5 打 zip，`index.html` 必须在根，纯本地无网络
- 脚本必须 classic 外链 `<script src>`（无 `type=module`、无内联 script、无 `onclick=`、无 `javascript:`、无 `eval`/`new Function`、无 WebAssembly、无外部域名）
- 禁止：fetch / XHR / WebSocket / clipboard / Worker / SW / iframe / `a[download]` / blob 下载 / `target=_blank` / `window.open`
- 文件类型限：html / css / js / png / jpg / gif / webp / svg / woff / woff2 / json
- zip ≤10MB（建议 ≤2MB）；字体子集化进包（见字体段），figures 占主要体积
- 三个 esbuild 桩物理移除违规代码：aiNodes（DeepSeek fetch）、html-to-image（fetch 资源）、exportImage/exportData（a.download / Blob）
- 校验：`scripts/scan_xhs.cjs`（context-aware，只查真实资源加载）、`scripts/smoke_xhs.cjs`（puppeteer 渲染 + 点击）

## 4. 字体真名坑
- 字体内部 family 名是 `Huiwen-mincho`（小写 m + 连字符）
- `theme.css` / `ShareCard.jsx` 的 SERIF 写错成 `'HuiwenMincho'`（大写 M）→ 明朝体静默回退系统衬线
- 修正：统一写 `'Huiwen-mincho'`

## 5. PWA 字体缓存
- vite-plugin-pwa：workbox 排除 otf，仅缓存 woff2；离线回退系统字体
- 全量 otf（24MB）不进 SW 缓存

## 6. 沙箱批量删除保护
- `rm -rf dist/*` 与 `vite build` 清 outDir 会被拦截失败
- 解决：构建到干净 /tmp 目录（如 /tmp/deploy-ai）直接 deploy

## 7. 体积上限 / CloudStudio 504
- 单 flavor 约 32M（含 figures / fonts）；两个 flavor 叠一起 → 58M → 上传 504
- 解决：分别构建到不同 /tmp 目录、分别部署（串行）

## 8. 导航激活态漂移
- 移动 Tabbar 与 PC Sidebar 必须共用 `src/lib/nav.js` 的 `isTabActive` / `TAB_OWNERS`（唯一来源）
- PC `.pc-side button.active` 白底在白侧栏上隐形 → 改金色底（见 design-tokens.md）

## 9. useEffect 死循环（草稿持久化）
- 草稿 useEffect 若把 `session` 放进依赖 → store 更新 → 新引用 → effect 重燃 → 死循环
- 解决：依赖只放草稿内容字段（skillsSel / knowSel / ...），不放 `session`
