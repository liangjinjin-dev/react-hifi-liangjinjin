---
name: react-hifi-prototype
description: This skill scaffolds a mobile-first, high-fidelity React + Vite web prototype with a custom Chinese Mincho serif typeface and a polished design system, then carries it through font subsetting (pyftsubset, with font-spider as fallback), multi-flavor builds (AI-enabled / no-AI public / offline XHS mini-tool via esbuild iife), PWA, and CloudStudio deploy. Use it when building personal-IP web apps, self-assessment / talent tools, or any UI-rich SPA that needs a real Chinese serif, or when asked to "turn this React prototype into a reusable skill" or "subset a Chinese web font".
agent_created: true
---

# React Hifi Prototype（高保真 React 原型脚手架 + 天赋挖掘机范例）

## Overview
从零搭建一个移动优先、带中文明朝体（Huiwen-mincho）与设计系统的 React 高保真 Web 原型，并贯穿完成字体子集化、多版本构建、PWA、部署全流程。以「天赋挖掘机」个人 IP 应用为实战范例（三问 → 快速预判 / 完整挖掘 → 强项配方 → 第一步出门包），其经验已固化为本 skill 的脚本与参考文档。

## When to use
- 用户要做「个人 IP / 自测 / 天赋挖掘 / 测评」类 H5 或 Web 应用，且要求高保真 UI + 中文衬线字体
- 用户要求把中文字体（otf/ttf）子集化进 Web（含 ≤10MB 小工具约束）
- 用户要求产出「AI 版 / 无 AI 公开版 / 小红书离线小工具」多 flavor
- 用户要求把现有 React 原型封装成可复用 skill 并开源

## Workflow

### 1. 脚手架初始化
- 技术栈：React 18 + Vite + HashRouter + Zustand（persist，localStorage key 自定义）+ html-to-image（导出图用）
- 移动视口 390×844 走查，≥768 切 PC Sidebar；底部 Tabbar 与 PC 侧栏共用 `src/lib/nav.js` 的 `isTabActive` / `TAB_OWNERS` 作为激活态唯一来源（避免移动/PC 漂移）
- 目录结构与多版本同步硬规则见 `references/project-structure.md`

### 2. UI 设计系统
- 全部颜色 / 字体走 CSS 变量（见 `references/design-tokens.md`），禁止裸值
- 设计 token 分 typography / color / spacing / layout / radius；暗色人物卡用 `#1A1A1A` 铭牌式对比
- 流程页归属用 `TAB_OWNERS` 映射到 3 个主 tab（首页 / 卡片 / 强项），PC `.pc-side button.active` 用金色底（白底在白侧栏上隐形，已踩坑）

### 3. 字体（子集化，必做）
- 全量 `HuiwenMincho.otf` 24MB，直接进 Web 超体积；必须子集化
- **主方案 pyftsubset（已验证）**：`bash scripts/subset_font.sh <输入.otf> <字符集.txt> <输出.woff2>`
  - 字符集生成：`node scripts/extract_charset.cjs`（遍历 src/ + 根 json 抽字）→ 再合并 GB2312 一级字(3755) + 高频二级字
  - 当前子集 3948 字 ≈ 2.41MB woff2，覆盖 UI 固定文案 + 用户手打动态输入；生僻二级字回退系统衬线
  - 要 100% 覆盖（含全部 GB2312 二级字 3008）扩到 ~4.7MB 字体、总包 ~8.8MB，仍 <10MB 上限
- **备选 font-spider（字蛛）**：`font-spider <html>` 自动化子集化更省心，但 ⚠️ 本环境 node 22 下处理 24MB otf 会 `exit 137`（SIGKILL，fonteditor-core 不兼容 / OOM），已踩坑；若用户坚持用字蛛，先在小字体验证，失败即降级 pyftsubset
- **字体真名坑（已踩）**：字体内部 family 名是 `Huiwen-mincho`（小写 m + 连字符），CSS `font-family` 必须写 `'Huiwen-mincho'`，写错（如 `'HuiwenMincho'`）会静默回退系统衬线
- 子集字体已备于 `assets/fonts/HuiwenMincho.subset.woff2`，`@font-face` 指向它

### 4. 多版本构建
- 通过 env 区分 flavor：`VITE_AI_ENABLED`（非 `'false'` = AI 版；`='false'` = 无 AI 公开版）、`VITE_XHS`（`==='true'` = 小红书小工具）
- AI 版 / 无 AI 版：`vite build --outDir /tmp/deploy-xxx`（**构建到干净 /tmp 目录直接 deploy，别碰 dist/，沙箱批量删除保护会拦截 `rm -rf dist/*` 与 `vite build` 清 outDir**）
- **⚠️ 体积上限约 32MB/flavor**：两个 flavor 叠一起 ≈58M → CloudStudio 上传 504；必须分别构建到不同 /tmp 目录、分别部署
- **XHS 离线小工具**（无网络 H5，zip ≤10MB）：Vite ESM→IIFE 会让 react-dom/client 触发 React #299「Invalid hook call」，必须用 **esbuild 直接 bundle（`--format=iife`）**；范例见 `scripts/build_xhs.cjs`
  - 三个 esbuild 桩物理移除离线容器禁止代码：aiNodes（DeepSeek fetch）、html-to-image（fetch 资源）、exportImage/exportData（a.download / Blob）
  - 合规扫描 `scripts/scan_xhs.cjs`、puppeteer 冒烟 `scripts/smoke_xhs.cjs`
  - 约束与坑见 `references/pitfalls.md`

### 5. PWA
- `vite-plugin-pwa`：build 自动生成 manifest + sw.js + 注册；`index.html` 加 theme-color / apple-touch-icon / mobile-web-app-capable
- 字体 otf 不进 SW 缓存（workbox 排除 otf，仅缓存 woff2）；离线回退系统字体
- 安装：Android Chrome 菜单「安装应用」；iOS Safari 分享 →「添加到主屏幕」

### 6. 部署（CloudStudio）
- `workbuddy_cloudstudio_deploy`：先 unpublish 旧 shareLink 再 deploy；两个 deploy **必须串行**
- **每次部署后 curl 确认状态码**，不能假设旧链仍活
- 发布链接在「设置 - 数据管理 - 我发布的应用」管理

## 实战范例：天赋挖掘机
- 流程：天赋显影三问 → 快速预判（5 分钟出预判卡）/ 完整挖掘（15-25 分钟：80 选项定位 → 天赋卡片 → 同天赋历史人物 → 强项配方 → 校准 → MVP）→ 第一步出门包（每个强项下方挂「做什么 / 找谁 / 怎么说 / 别做」，一句敢发出去的消息）
- 多版本同步硬规则：改任何代码必须同步 AI 版 / 无 AI 版 / XHS 版，避免产物漂移（见 `references/project-structure.md`）
- 草稿续接：强项配方每步实时存 `session.quenchDraft`，`useEffect` 依赖**不放 `session`**（否则 store 更新 → 引用变化 → 死循环）
- 导航高亮：PC 侧栏 active 用金色底（白底在白侧栏隐形），移动 Tabbar 同逻辑，走 `src/lib/nav.js` 单一来源

## Resources
- `scripts/subset_font.sh` — pyftsubset 字体子集化（主方案）
- `scripts/extract_charset.cjs` — 遍历源码抽字生成字符集
- `scripts/build_xhs.cjs` — esbuild iife 构建 XHS 离线小工具（范例）
- `scripts/scan_xhs.cjs` / `scripts/smoke_xhs.cjs` — XHS 合规扫描 / puppeteer 冒烟
- `assets/fonts/HuiwenMincho.subset.woff2` — 已子集化明朝体（3948 字）
- `assets/template/` — 最小 React + Vite 原型骨架（复制起步）
- `references/design-tokens.md` — CSS 变量设计 token 表
- `references/project-structure.md` — 目录结构与多版本同步硬规则
- `references/pitfalls.md` — 字蛛崩溃 / React #299 / XHS≤10MB / 字体真名坑 等踩坑
- `references/charset-full.txt` — 当前生效字符集（3948 字，参考）
