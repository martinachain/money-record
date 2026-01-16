#!/bin/bash

# 生成 PWA 图标脚本
# 使用方法: ./scripts/generate-icons.sh [源图片路径]
# 示例: ./scripts/generate-icons.sh ./public/logo.png
# 需要安装 ImageMagick: brew install imagemagick

SOURCE_IMAGE="${1:-./public/logo.png}"
OUTPUT_DIR="./public/icons"

if [ ! -f "$SOURCE_IMAGE" ]; then
  echo "错误: 找不到源图片 $SOURCE_IMAGE"
  echo "请提供 logo.png 文件路径作为参数"
  exit 1
fi

# 检查是否安装了 ImageMagick
if ! command -v convert &> /dev/null; then
  echo "错误: 需要安装 ImageMagick"
  echo "macOS: brew install imagemagick"
  echo "Ubuntu: sudo apt-get install imagemagick"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# 生成各种尺寸的图标
SIZES=(72 96 128 144 152 192 384 512)

for SIZE in "${SIZES[@]}"; do
  echo "生成 ${SIZE}x${SIZE} 图标..."
  convert "$SOURCE_IMAGE" -resize ${SIZE}x${SIZE} "$OUTPUT_DIR/icon-${SIZE}x${SIZE}.png"
done

echo "图标生成完成!"
echo "生成的图标位于: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"
