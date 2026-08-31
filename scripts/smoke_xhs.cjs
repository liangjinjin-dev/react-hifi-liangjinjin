const puppeteer = require('/Users/wangin/Desktop/AIworkspace/2026-08-16-21-05-21/node_modules/puppeteer-core')
const { spawn } = require('child_process')
const ROOT = '/tmp/te-xhs-esbuild'
const PORT = 8137
const PY = '/Users/wangin/.workbuddy/binaries/python/versions/3.13.12/bin/python3'
const server = spawn(PY, ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' })
const sleep = ms => new Promise(r => setTimeout(r, ms))
;(async () => {
  await sleep(900)
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844 })
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) console.log('HTTP ' + r.status() + ' => ' + r.url()) })
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0', timeout: 20000 })
  await sleep(600)
  const rootLen = await page.evaluate(() => document.getElementById('root').innerHTML.length)
  await page.evaluate(() => document.fonts.ready)
  const fontInfo = await page.evaluate(() => {
    const hm = [...document.fonts].filter(f => f.family === 'Huiwen-mincho').map(f => ({ family: f.family, status: f.status }))
    return hm
  })
  const titleFont = await page.evaluate(() => {
    const el = document.querySelector('.page-title') || document.querySelector('h1') || document.querySelector('[class*="title"]')
    return el ? getComputedStyle(el).fontFamily : '(no title el)'
  })
  // 字体外观验证：找一段用衬线栈的文字，截图局部
  await page.screenshot({ path: '/tmp/xhs-smoke.png', fullPage: false })
  console.log('rootLen          =', rootLen)
  console.log('Huiwen-mincho 字体面 =', JSON.stringify(fontInfo))
  console.log('标题 computed font  =', titleFont)
  console.log('页面错误          =', errs.length ? errs : 'none')
  const fontLoaded = fontInfo.some(f => f.status === 'loaded')
  await browser.close()
  server.kill()
  process.exit(errs.length === 0 && fontLoaded && rootLen > 200 ? 0 : 1)
})().catch(e => { console.error(e); server.kill(); process.exit(2) })
