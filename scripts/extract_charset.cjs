const fs=require('fs'), path=require('path');
const ROOT='src';
const EXTS=new Set(['.js','.jsx','.json','.css','.ts','.tsx']);
const chars=new Set();
// 半角基础标点/符号也要保留（UI 含 : , . ( ) - 等）
const keepPunct="，。、；：？！“”‘’（）《》【】「」·…—★☆%&@#*+=/\\<>_|~^".split('');
for(const p of keepPunct) chars.add(p);
function walk(d){
  for(const e of fs.readdirSync(d)){
    const p=path.join(d,e); const st=fs.statSync(p);
    if(st.isDirectory()) walk(p);
    else if(EXTS.has(path.extname(p).toLowerCase())){
      let s; try{ s=fs.readFileSync(p,'utf8'); }catch{ continue; }
      for(const ch of s){
        const cp=ch.codePointAt(0);
        if((cp>=0x4e00&&cp<=0x9fff)||        // CJK 基本
           (cp>=0x3400&&cp<=0x4dbf)||        // CJK 扩展A
           (cp>=0x3000&&cp<=0x303f)||        // CJK 符号标点
           (cp>=0xff00&&cp<=0xffef)||        // 全角字符
           (cp>=0x2010&&cp<=0x206f)||        // 通用标点（含 – — ‘ ’ “ ” …）
           /[0-9A-Za-z]/.test(ch)) chars.add(ch);
      }
    }
  }
}
walk(ROOT);
// 根目录可能的 json 数据
for(const f of fs.readdirSync('.')){
  if(f.endsWith('.json') && fs.statSync(f).isFile()){
    let s; try{ s=fs.readFileSync(f,'utf8'); }catch{ continue; }
    for(const ch of s){ const cp=ch.codePointAt(0);
      if((cp>=0x4e00&&cp<=0x9fff)||(cp>=0x3400&&cp<=0x4dbf)||(cp>=0x3000&&cp<=0x303f)||(cp>=0xff00&&cp<=0xffef)||/[0-9A-Za-z]/.test(ch)) chars.add(ch);
    }
  }
}
const arr=[...chars].sort((a,b)=>a.codePointAt(0)-b.codePointAt(0));
fs.writeFileSync('/tmp/charset.txt', arr.join(''));
console.log('字符数(去重):', chars.size);
console.log('样例:', arr.slice(0,40).join(''));
