# 设计 Token（CSS 变量）

全部颜色 / 字体走 CSS 变量，禁止裸值。以下为「天赋挖掘机」实战 token，可作为新项目的起点。

## Typography
```css
:root{
  --serif: 'Huiwen-mincho', 'Songti SC', serif;   /* 全局明朝体衬线栈 */
  --font-size-base: 15px;
  --font-size-sm: 13px;
  --font-size-lg: 18px;
  --line-height: 1.7;
}
```
- 字体真名坑：family 名是 `Huiwen-mincho`（小写 m + 连字符），不是 `HuiwenMincho`。

## Color
```css
:root{
  --accent-gold: #B8935A;     /* 重点色：导航激活、按钮、左边框 */
  --bg-page: #F7F4EE;         /* 页面米白底 */
  --bg-card: #FFFFFF;         /* 卡片白 */
  --text-primary: #1A1A1A;    /* 主文字 */
  --text-secondary: #6B6B6B;
  --text-tertiary: #C4BFB5;   /* 弱提示 */
  --dark-card: #1A1A1A;       /* 暗色人物卡铭牌 */
}
```

## Spacing / Layout
```css
:root{
  --radius-card: 16px;
  --radius-pill: 999px;
  --gap: 12px;
  --safe-bottom: env(safe-area-inset-bottom, 0px); /* 移动端 Tabbar 安全区 */
}
```

## 导航激活态（移动 / PC 共用重点色）
```css
/* 移动底部 Tabbar */
.tabbar button.active{ background: var(--accent-gold); color:#fff; font-weight:700; }
.tabbar button.active::after{ content:''; /* 白色指示条 */ }

/* PC 侧边栏（≥768px）：白底在白侧栏上隐形，必须用金色底 */
@media (min-width:768px){
  .pc-side button.active{ background: var(--accent-gold); color:#fff; font-weight:700; }
}
```

## 暗色人物卡（铭牌式对比）
```css
.figure-card{ background: var(--dark-card); color:#fff; border-radius: var(--radius-card); }
```
