# react-hifi-prototype

一个可复用的 **React 高保真 Web 原型脚手架 Skill**：内置中文明朝体（Huiwen-mincho）子集化、完整 UI 设计系统、多版本构建（AI 版 / 无 AI 公开版 / 小红书离线小工具）、PWA 与 CloudStudio 部署，并以「天赋挖掘机」个人 IP 应用作为完整实战范例。

适用场景：个人 IP Web 应用、自我探索 / 天赋 / 测评类工具、任何需要**真实中文衬线字体 + 高保真 UI** 的 React SPA 原型。

---

## 能力一览

| 能力 | 说明 |
| --- | --- |
| 🔤 字体子集化 | `pyftsubset`（主方案）+ 字蛛 font-spider（备选）；把约 24MB 全量明朝体抽成约 2.4MB woff2 子集，规避小工具体积上限 |
| 🎨 设计系统 | 全量 CSS 变量 token（typography / color / spacing / layout / radius），禁止裸值，移动/PC 导航激活态单一来源 |
| 🧩 多版本构建 | AI 版 / 无 AI 公开版 / 小红书离线小工具（XHS，esbuild 直接打 iife 规避 React #299） |
| 📱 PWA | vite-plugin-pwa 构建自动生成 manifest + service worker，字体仅缓存 woff2 |
| 🚀 CloudStudio 部署 | 多 flavor 串行部署，发布后 curl 校验状态码 |
| 🛡 合规 + 冒烟 | XHS 离线包跑 8/8 合规校验 + puppeteer 渲染冒烟 |

---

## 目录结构

```
react-hifi-prototype/
├── SKILL.md                  # 技能主流程（触发条件 + 从零搭建全流程 + 踩坑点）
├── README.md                 # 本文件：安装 / 依赖 / 已知坑
├── scripts/
│   ├── subset_font.sh        # 字体子集化（pyftsubset 主方案）
│   ├── extract_charset.cjs   # 遍历 src/ 抽字生成字符集（/tmp/charset.txt）
│   ├── build_xhs.cjs         # XHS 离线小工具 esbuild 构建（⚠ 实战固化，见坑 11）
│   ├── scan_xhs.cjs          # XHS 合规扫描（8 项校验）
│   └── smoke_xhs.cjs         # puppeteer 渲染冒烟（含字体加载断言）
├── references/
│   ├── design-tokens.md      # 设计 token 表（CSS 变量）
│   ├── project-structure.md  # 目录结构与多版本同步硬规则
│   ├── pitfalls.md           # 踩坑记录（完整版）
│   └── charset-full.txt      # 当前生效字符集（3948 字）
└── assets/
    ├── fonts/
    │   └── HuiwenMincho.subset.woff2   # 子集明朝体（3948 字 ≈2.4MB，已验证）
    └── template/             # 最小 React+Vite 原型骨架（复制起步）
        ├── README.md         # 模板自己的起步说明
        ├── index.html
        ├── global.css
        └── main.jsx
```

---

## 快速开始

### 安装为豆包工作 / WorkBuddy 技能

1. 把本仓库 clone（或整体复制）到你的**技能根目录**，例如：

   ```bash
   git clone https://github.com/liangjinjin-dev/react-hifi-liangjinjin.git \
     <技能根目录>/react-hifi-prototype
   ```

   技能根目录通常形如 `<环境路径>/workspace/.user_skills/`（用户技能目录），不同客户端/系统可能不同，以你本机已有的技能目录为准。

2. 重启豆包工作客户端。之后向豆包描述「做一个带中文明朝体的 React 高保真原型」这类任务时，会自动命中本 Skill（触发条件见 `SKILL.md` 的 description）。

3. 按 `SKILL.md` 的流程从零搭建你的原型。

### 从零搭建一个原型（核心流程）

```bash
# 1. 脚手架：复制 assets/template/ 起步（注意坑 10：模板是平铺结构）
npm create vite@latest my-app -- --template react   # 或直接复制 template
cd my-app
npm install react-router-dom zustand

# 2. 字体子集化（首次必做）
node <skill>/scripts/extract_charset.cjs            # 抽字 → /tmp/charset.txt
bash <skill>/scripts/subset_font.sh 全量字体.otf /tmp/charset.txt assets/fonts/子集.woff2

# 3. 开发走查（移动视口 390×844）
npm run dev

# 4. 构建（AI 版 / 无 AI 版 / XHS 版见 SKILL.md 多版本构建节）
npm run build
```

---

## 依赖说明

| 依赖 | 用途 | 提供方 | 备注 |
| --- | --- | --- | --- |
| Python 3 + fontTools ≥ 4.6 | 字体子集化（pyftsubset） | `subset_font.sh` | 可用环境变量 `PY` 覆盖解释器路径 |
| Node.js ≥ 18 | 字符集抽取 / XHS 构建 / 扫描 | `extract_charset.cjs` 等 | 纯 Node，无三方依赖 |
| esbuild | XHS 离线小工具 iife 打包 | `build_xhs.cjs` | ⚠ 脚本内硬编码了本机路径，见坑 11 |
| puppeteer-core + 系统 Chrome | 渲染冒烟、字体加载断言 | `smoke_xhs.cjs` | ⚠ 同上，需按本机改路径 |
| React 18 + Vite 5 | 原型脚手架 | 模板 | 配合 react-router-dom / zustand |

> 字体资产 `HuiwenMincho.subset.woff2` 为「汇文明朝体」的子集化产物。**对外分发前请确认你所使用字体的授权许可**；如字体不允许再分发，请替换为你有权使用的字体并重新子集化。

---

## 已知踩坑（要点版）

> 完整 11 条踩坑记录见 `references/pitfalls.md`，以下为速查版：

1. **字蛛 font-spider 崩溃**：node 22 下处理 24MB otf 会 `exit 137`（OOM）。→ 用 `pyftsubset` 主方案。
2. **React #299 Invalid hook call（XHS）**：Vite ESM→IIFE 会触发。→ XHS 版必须用 esbuild 直接打 `--format=iife`。
3. **XHS ≤10MB 约束**：离线 H5 的 `index.html` 必须在根、classic 外链脚本、禁止 fetch/XHR/下载等能力；白名单文件类型；zip ≤10MB。
4. **字体真名坑**：字体内部 family 名是 `Huiwen-mincho`（小写 m + 连字符），CSS `font-family` 写错会静默回退系统衬线。
5. **PWA 字体缓存**：workbox 排除 otf，仅缓存 woff2。
6. **沙箱批量删除保护**：`rm -rf dist/*` 与 `vite build` 清 outDir 可能被拦截。→ 构建到干净 `/tmp` 目录。
7. **体积上限 / CloudStudio 504**：单 flavor 约 32MB，两个叠一起 ≈58M 会上传 504。→ 分别构建、串行部署。
8. **导航激活态漂移**：移动 Tabbar 与 PC 侧栏共用 `nav.js` 单一来源；PC 激活态用金色底（白底在白侧栏上隐形）。
9. **useEffect 死循环（草稿持久化）**：草稿 `useEffect` 把 `session` 放进依赖 → store 更新 → 新引用 → effect 重燃 → 死循环。→ 依赖只放草稿内容字段，不放 `session`。
10. **⚠（本仓库新增）模板是平铺结构**：`assets/template/index.html` 用相对路径引用 `./main.jsx`、`./global.css`，因此模板文件必须**平铺在同一目录**（`index.html` / `global.css` / `main.jsx` / `fonts/` 同级）。若按 Vite 默认 `src/` 结构放置，构建会报 `Could not resolve "./main.jsx" from "index.html"`。
11. **⚠（本仓库新增）XHS 脚本为实战固化**：`build_xhs.cjs` / `scan_xhs.cjs` / `smoke_xhs.cjs` 是从「天赋挖掘机」项目固化的范例，硬编码了项目源码路径（`src/main.jsx`、`src/styles/`、`public/figures`）、输出目录（`/tmp/te-xhs-esbuild`）与本机依赖路径（`/Users/.../node_modules/esbuild`、`puppeteer-core`）。**复用前必须改成你自己项目的路径**，不能直接运行。

---

## 隐私与安全声明

**本仓库不含任何密钥、API Key、Token 或个人隐私内容。**

- 仓库内只有通用脚手架代码、字体子集（公开资产）、模板骨架与说明文档。
- 范例中涉及 AI 的能力（如 BYOK）均**由使用者本人自填 key**——运行时从 `localStorage` 读取，不内置、不硬编码任何真实凭证。
- 不读取、不上传任何 `.env`、私钥、token 或隐私日志。
- 若你把真实代理代码并入本仓库，请先把密钥抽成环境变量/占位符，切勿将明文 key 一并提交。

---

## License

[MIT](LICENSE) —— 自由使用、修改、再分发。
