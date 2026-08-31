const esbuild = require('/Users/wangin/Desktop/AIworkspace/2026-08-16-21-05-21/node_modules/esbuild')
const fs = require('fs')

const OUT = '/tmp/te-xhs-esbuild'
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT + '/assets', { recursive: true })

esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2015',
  outfile: OUT + '/assets/app.js',
  loader: { '.js': 'jsx', '.jsx': 'jsx', '.css': 'empty' },
  jsx: 'automatic',
  define: {
    'import.meta.env.VITE_AI_ENABLED': '"false"',
    'import.meta.env.VITE_AI_MODEL': '"deepseek-chat"',
    'import.meta.env.VITE_AI_PROXY_URL': '""',
    'import.meta.env.VITE_XHS': '"true"'
  },
  // XHS（无 AI / 离线）构建：
  // 1) aiNodes 重定向到无 fetch 的桩，彻底移除 DeepSeek 依赖
  // 2) html-to-image 重定向到 no-op 桩，移除其内含的 fetch / 外部资源加载（导出图片功能已被 !XHS 屏蔽）
  plugins: [
    {
      name: 'xhs-ai-stub',
      setup(b) {
        b.onResolve({ filter: /\.\.\/lib\/aiNodes$/ }, () => ({ path: '/tmp/_xhs_ai_stub.js' }))
      }
    },
    {
      name: 'xhs-h2i-stub',
      setup(b) {
        b.onResolve({ filter: /^html-to-image$/ }, () => ({ path: '/tmp/_xhs_h2i_stub.js' }))
      }
    },
    {
      name: 'xhs-export-stub',
      setup(b) {
        // 导出图片 / 导出 JSON 都依赖 a.download / Blob / createObjectURL，离线容器禁止。
        // 这两个功能已被 !XHS 屏蔽，把模块重定向到 no-op 桩，物理移除下载代码。
        b.onResolve({ filter: /utils\/exportImage$/ }, () => ({ path: '/tmp/_xhs_export_image_stub.js' }))
        b.onResolve({ filter: /utils\/exportData$/ }, () => ({ path: '/tmp/_xhs_export_data_stub.js' }))
      }
    }
  ]
}).then(() => {
  // CSS：内联 theme.css，把 @font-face 指向子集字体（~956KB woff2，离线可用）
  let g = fs.readFileSync('src/styles/global.css', 'utf8')
  const t = fs.readFileSync('src/styles/theme.css', 'utf8')
  g = g.replace(/@import\s+['"]\.\/theme\.css['"];?/, '/* inlined theme */\n' + t)
  // 用子集字体的 @font-face 替换原块；修正家族名大小写/连字符，使其与字体真名 Huiwen-mincho 匹配
  // （原 theme.css 写的 'HuiwenMincho' 与字体真名不符，会导致明朝体静默回退系统衬线）
  g = g.replace(/@font-face\s*\{[\s\S]*?\}\s*/g,
    "@font-face{font-family:'Huiwen-mincho';src:url('./fonts/HuiwenMincho.subset.woff2') format('woff2');font-display:swap;}\n")
  g = g.replace(/'HuiwenMincho'/g, "'Huiwen-mincho'")
  fs.writeFileSync(OUT + '/assets/app.css', g)
  // figures
  fs.mkdirSync(OUT + '/figures', { recursive: true })
  for (const f of fs.readdirSync('public/figures')) {
    fs.copyFileSync('public/figures/' + f, OUT + '/figures/' + f)
  }
  // 子集字体（几百KB woff2，放在 assets/fonts/，与 app.css 的相对 url 对齐）
  fs.mkdirSync(OUT + '/assets/fonts', { recursive: true })
  fs.copyFileSync('/tmp/fontsubset/HuiwenMincho.subset.woff2', OUT + '/assets/fonts/HuiwenMincho.subset.woff2')
  // index.html：classic 外链，无 type=module / 无内联 script
  fs.writeFileSync(OUT + '/index.html', `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<title>天赋挖掘机</title>
<link rel="icon" href="data:," />
<link rel="stylesheet" href="./assets/app.css" />
</head>
<body>
<div id="root"></div>
<script src="./assets/app.js"></script>
</body>
</html>
`)
  console.log('XHS build done')
}).catch(e => { console.error(e); process.exit(1) })
