# react-hifi-prototype

一个可复用的 **React 高保真 Web 原型脚手架 Skill**,内置中文明朝体子集化 + 完整 UI 设计系统,并以「天赋挖掘机」AI 版作为实战范例。

适用场景:个人 IP Web 应用、自我探索 / 天赋类工具、任何需要真实中文衬线字体 + 高保真 UI 的 SPA 原型。

## 能力一览

- **字体子集化**:`pyftsubset`(主方案)+ 字蛛(font-spider)备选;把 24MB 全量明朝体抽成约 2.4MB 子集,规避小工具体积上限。
- **多版本构建**:AI 版 / 无 AI 公开版 / 小红书离线小工具(XHS,esbuild 直接打 iife 规避 React #299)。
- **PWA**:构建自动生成 manifest + service worker。
- **CloudStudio 部署**:串行部署两个 flavor,各约 32MB,发布后 curl 校验状态码。
- **合规扫描 + 冒烟**:XHS 离线包跑 8/8 合规校验 + puppeteer 渲染冒烟。

## 目录结构

```
SKILL.md              # 主流程(触发条件 + 从零搭建全流程 + 踩坑点)
scripts/              # subset_font.sh / extract_charset.cjs / build_xhs.cjs / scan_xhs.cjs / smoke_xhs.cjs
references/           # design-tokens.md / project-structure.md / pitfalls.md / charset-full.txt
assets/
  fonts/              # HuiwenMincho.subset.woff2(3948 字子集,2.3MB)
  template/           # 最小 React+Vite 原型骨架(index.html / global.css / main.jsx)
```

## 怎么用

把本仓库作为 WorkBuddy Skill 安装到 `~/.workbuddy/skills/`,或参考 `SKILL.md` 的流程逐步搭建原型。详见 `SKILL.md`。

---

## 🔒 隐私与安全声明

**本 skill 不含任何密钥、API Key、Token 或个人隐私内容。**&#8203;

- 仓库内只有通用脚手架代码、字体子集(公开资产)、模板骨架与说明文档。
- 所有涉及 AI 的能力(如范例中的 BYOK)均 **由使用者本人自填 key**——运行时从 `localStorage` 读取,**不内置、不硬编码任何真实凭证**。
- 不读取、不上传任何 `.env`、私钥、token 或隐私日志。
- 部署用的 GitHub Token 仅用于一次性推送,推完即从本地 `remote` / `.git/config` 清除,不留存、不进 git 历史。

> 使用者若自行把真实代理代码(`ai-proxy/` 等)并入本 skill,请先把其中的密钥抽成环境变量 / 占位符,切勿将明文 key 一并提交。

---

## License

MIT —— 自由使用、修改、再分发。
