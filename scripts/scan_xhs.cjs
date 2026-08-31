// XHS 合规扫描：对 /tmp/te-xhs-esbuild 整个产物目录校验小红书小工具规范
const fs = require('fs')
const path = require('path')

const ROOT = '/tmp/te-xhs-esbuild'
const results = []

function walk(dir, cb) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, cb)
    else cb(p)
  }
}

// 1) 结构：index.html 必须在根
results.push(['index.html 在根', fs.existsSync(path.join(ROOT, 'index.html'))])

// 2) 体积 ≤10MB
let total = 0
walk(ROOT, p => { total += fs.statSync(p).size })
const mb = (total / 1024 / 1024).toFixed(2)
results.push(['总体积 ≤10MB (当前 ' + mb + 'MB)', total <= 10 * 1024 * 1024])

// 3) 文件类型白名单
const ALLOWED = new Set(['.html','.css','.js','.png','.jpg','.gif','.webp','.svg','.woff','.woff2','.json'])
let badType = []
walk(ROOT, p => { const ext = path.extname(p).toLowerCase(); if (!ALLOWED.has(ext)) badType.push(p) })
results.push(['仅白名单文件类型', badType.length === 0])
if (badType.length) console.log('  非法文件:', badType)

// 4) HTML：无 type=module / 无内联 script / 外链 classic
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
results.push(['HTML 无 type="module"', !/type\s*=\s*["']?module["']?/i.test(html)])
// 内联 script = 带内容的 <script>（无 src 属性）；外链 classic <script src> 是允许的
results.push(['HTML 无内联 <script>', !/<script(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/i.test(html)])
results.push(['HTML 外链 classic <script src>', /<script[^>]*src\s*=\s*["']/i.test(html)])

// 5) 禁止能力（在 JS 中扫描）
const FORBID = [
  ['fetch(', /\bfetch\s*\(/],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/],
  ['WebSocket', /\bWebSocket\b/],
  ['navigator.clipboard', /navigator\s*\.\s*clipboard/],
  ['execCommand', /execCommand/],
  ['ServiceWorker', /serviceWorker/i],
  ['Worker(', /\bnew\s+Worker\s*\(/],
  ['iframe', /<iframe|createElement\(\s*["']iframe["']\)|document\.write/i],
  ['object/embed', /<object|<embed/i],
  ['a[download]', /a\s*\.\s*download|\.download\s*=/i],
  ['Blob download', /URL\s*\.\s*createObjectURL|new\s+Blob\s*\(/i],
  ['target=_blank', /target\s*=\s*["']?\s*_blank/i],
  ['window.open', /window\s*\.\s*open\s*\(/],
  ['eval(', /\beval\s*\(/],
  ['new Function', /new\s+Function\s*\(/],
  ['WebAssembly', /WebAssembly/],
  ['import(', /\bimport\s*\(/],
  ['javascript:', /javascript\s*:/i],
  ['onclick= 属性', /\sonclick\s*=/i],
]
let jsHits = []
walk(ROOT, p => {
  if (path.extname(p).toLowerCase() !== '.js') return
  const s = fs.readFileSync(p, 'utf8')
  for (const [name, re] of FORBID) {
    if (re.test(s)) jsHits.push(name + ' @ ' + p.replace(ROOT, ''))
  }
})
results.push(['JS 无禁止能力', jsHits.length === 0])
if (jsHits.length) console.log('  命中禁止能力:\n   - ' + jsHits.join('\n   - '))

// 6) 外部域名引用：仅检查「真正会发起资源加载」的上下文（script/link/iframe src、fetch、XHR、Image、Worker、外链导航）。
//    框架内部的字符串字面量（React 错误解码器 URL、SVG/xlink 命名空间、路由/状态库告警文案）不是资源加载，离线安全，不计入。
const EXT_RES = [
  /<script[^>]*\bsrc\s*=\s*["']https?:/i,
  /<link[^>]*\bhref\s*=\s*["']https?:/i,
  /<iframe[^>]*\bsrc\s*=\s*["']https?:/i,
  /\bfetch\s*\(\s*["']https?:/i,
  /XMLHttpRequest[^)]*\.open\s*\([^)]*["']https?:/i,
  /new\s+Image\s*\([^)]*\)\s*\.src\s*=\s*["']https?:/i,
  /location\s*\.\s*href\s*=\s*["']https?:/i,
  /\bimport\s*\(\s*["']https?:/i,
  /new\s+Worker\s*\(\s*["']https?:/i,
]
let extRef = []
walk(ROOT, p => {
  const ext = path.extname(p).toLowerCase()
  if (!['.html','.css','.js'].includes(ext)) return
  const s = fs.readFileSync(p, 'utf8')
  for (const re of EXT_RES) {
    const m = s.match(re)
    if (m) extRef.push(m[0] + ' @ ' + p.replace(ROOT, ''))
  }
})
results.push(['无外部 http(s) 资源加载', extRef.length === 0])
if (extRef.length) console.log('  外部资源加载:\n   - ' + [...new Set(extRef)].join('\n   - '))

// 汇总
console.log('\n===== 合规校验结果 =====')
let pass = 0
for (const [name, ok] of results) {
  console.log((ok ? '✅' : '❌') + ' ' + name)
  if (ok) pass++
}
console.log(`\n通过 ${pass}/${results.length}`)
process.exit(pass === results.length ? 0 : 2)
