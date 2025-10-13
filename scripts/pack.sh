#!/bin/zsh
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
OUT_DIR="$ROOT_DIR/dist"
ZIP_NAME="cursor-usage-cost-overlay.zip"

mkdir -p "$OUT_DIR"

# 校验必须文件是否存在
for f in manifest.json content.js; do
  if [ ! -f "$ROOT_DIR/$f" ]; then
    echo "缺少必需文件: $f" >&2
    exit 1
  fi
done

# 校验图标
for s in 16 48 128; do
  if [ ! -f "$ROOT_DIR/icons/icon${s}.png" ]; then
    echo "提示：未找到 icons/icon${s}.png（商店建议提供该尺寸图标）" >&2
  fi
done

cd "$ROOT_DIR"
rm -f "$OUT_DIR/$ZIP_NAME"
zip -r "$OUT_DIR/$ZIP_NAME" \
  manifest.json \
  content.js \
  README.md \
  README.en.md \
  PRIVACY.md \
  PRIVACY.en.md \
  TERMS.md \
  TERMS.en.md \
  icons \
  _locales \
  pages \
  -x "**/.DS_Store" "**/.git/**" "dist/**"

echo "打包完成：$OUT_DIR/$ZIP_NAME"
