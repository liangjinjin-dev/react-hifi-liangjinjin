#!/usr/bin/env bash
# 中文字体子集化：把全量 otf/ttf 按应用实际用字抽稀为 woff2
# 主方案：fonttools pyftsubset（已验证；node22 下字蛛 font-spider 处理 24MB otf 会 exit 137 OOM）
# 备选 font-spider（字蛛）：font-spider <html> 自动化更省心，但本环境大字体崩溃，见 references/pitfalls.md
#
# 用法：
#   bash subset_font.sh <输入字体.otf> <字符集.txt> <输出.woff2>
# 示例：
#   bash subset_font.sh public/fonts/HuiwenMincho.otf charset.txt assets/fonts/HuiwenMincho.subset.woff2
set -euo pipefail

IN="${1:?用法: subset_font.sh <输入.otf> <字符集.txt> <输出.woff2>}"
CHARSET="${2:?缺少字符集文件}"
OUT="${3:?缺少输出路径}"

# 优先用隔离 venv 的 fonttools（已装 4.63.0）；否则回退系统 python -m fontTools
PY="${PY:-/Users/wangin/.workbuddy/binaries/python/envs/default/bin/python}"

if [ ! -f "$IN" ]; then echo "✗ 输入字体不存在: $IN" >&2; exit 1; fi
if [ ! -f "$CHARSET" ]; then echo "✗ 字符集不存在: $CHARSET" >&2; exit 1; fi

mkdir -p "$(dirname "$OUT")"

"$PY" -m fontTools.subset "$IN" \
  --text-file="$CHARSET" \
  --output-file="$OUT" \
  --flavor=woff2 \
  --no-hinting \
  --desubroutinize \
  --layout-features=''

echo "✓ 子集化完成: $OUT ($(du -h "$OUT" | cut -f1))"
echo "  提示：字体内部 family 名通常是 'Huiwen-mincho'（小写 m+连字符），CSS font-family 必须写对，否则静默回退系统衬线"
