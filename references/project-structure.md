# 项目结构与多版本同步硬规则

## 目录结构（React 18 + Vite + HashRouter + Zustand）
```
src/
  main.jsx                 # 入口（HashRouter）
  App.jsx                  # 路由总装
  lib/
    nav.js                 # isTabActive / TAB_OWNERS —— 导航激活态唯一来源（移动/PC 共用）
    aiNodes.js             # AI 候选生成（AI 版用；XHS 版被桩替换）
  store/useStore.js        # Zustand persist（key 自定义），会话/草稿/配方
  pages/                   # Home / MyCards / Quench / Calibration / Mvp / Flow...
  components/              # Tabbar / Sidebar / TalentCard / FigureAvatar / FirstStepKit...
  styles/
    global.css             # 全局样式 + 导航激活态
    theme.css              # 设计 token + @font-face
public/fonts/HuiwenMincho.otf   # 全量字体（24MB，不进 SW 缓存）
```

## 概念层级（易混，务必区分）
- `天赋显影三问` = 流程第 1 步
- `快速预判`(quick) = 三问本步、答完出 1 张规则预判卡结束（5 分钟）
- `完整挖掘`(full) = 三问 + 后续 5-6 步（15-25 分钟）
- 快速预判 = 三问；完整挖掘 ⊃ 三问
- 三问完成 = 1 张规则预判卡（无人物）；后续「天赋卡片」步才生成 3 张含代表人物卡

## 多版本同步硬规则（改代码必守）
1. **无 AI 公开版**：`VITE_AI_ENABLED=false` 构建的纯规则引擎版（隐藏 AI 开关、无降级弹窗），分享公众（小红书等）
2. **BYOK 无 key 透传**：`ai-proxy/`（cloudflare-worker.js / vercel-node.js，无 key 透传解决 CORS）须与 `src/lib/aiClient.js`（读 localStorage BYOK key）、`vite.config.js`（dev 中间件拦截 POST /api/ai）、`src/pages/Settings.jsx`（BYOK 输入框）一致
3. **XHS 小红书小工具**：离线 H5 打 zip，`index.html` 必须在根，纯本地无网络

## 构建 / 发布约定
- AI 版：`VITE_AI_ENABLED` 非 `'false'`；无 AI 版：`=false`；XHS：`VITE_XHS==='true'`
- **构建到干净 /tmp 目录直接 deploy**（别碰 dist/）：`rm -rf dist/*` 和 `vite build` 清 outDir 会被沙箱批量删除保护拦截失败
- **体积上限约 32MB/flavor**：两个 flavor 叠一起 → 58M → CloudStudio 上传 504；分别构建到不同 /tmp 目录、分别部署
- 发布：`workbuddy_cloudstudio_deploy`；先 unpublish 旧 shareLink 再 deploy；两个 deploy 串行；每次部署后 curl 确认状态码

## 草稿续接模式（强项配方等分步流程）
- 每步实时存 `session.quenchDraft`；`useEffect` 写 store 时**依赖数组不放 `session`**（否则 store 更新→新 `session` 引用→effect 重燃→死循环）
- 完成 / 重走时 `clearQuenchDraft()`，避免误读旧草稿
- 卡片页有进行中草稿时，按钮显示「继续强项配方 →」直达 `/flow/quench` 续作（跨页续接）
