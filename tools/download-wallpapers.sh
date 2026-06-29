#!/bin/bash
# ========================================
# 凡人修仙传 壁纸下载脚本
# 用法: bash scripts/download-wallpapers.sh
# ========================================
set -e

DEST_DIR="source/images"
mkdir -p "$DEST_DIR"

echo "=== 凡人修仙传 壁纸下载 ==="

# --- 方法1: Wallhaven (古风仙侠) ---
# API 不需要 key, 可直接访问
download_from_wallhaven() {
  echo "[1/5] 从 Wallhaven 搜索古风壁纸..."
  local queries=(
    "chinese+landscape+mountain"
    "ancient+china+fantasy"
    "ink+painting+landscape"
    "chinese+temple+forest"
    "anime+landscape+night"
  )
  local count=4
  for q in "${queries[@]}"; do
    local results=$(curl -s "https://wallhaven.cc/api/v1/search?q=$q&categories=100&purity=100&sorting=toplist&atleast=1920x1080" 2>/dev/null)
    local urls=$(echo "$results" | grep -oE '"path":"[^"]*"' | sed 's/"path":"\(.*\)"/\1/')
    for url in $urls; do
      count=$((count + 1))
      local filename="fanren-bg-${count}.jpg"
      echo "  下载: $filename"
      curl -s -L -o "$DEST_DIR/$filename" "$url" || echo "  [跳过] 下载失败"
      if [ $count -ge 10 ]; then break 2; fi
    done
  done
}

# --- 方法2: Unsplash API (免费) ---
download_from_unsplash() {
  echo "[2/5] 从 Unsplash 搜索山水意境..."
  # Unsplash 免费 demo key (50次/小时)
  local ACCESS_KEY="4d072b0fc6fd30e3b0de4b3a5dd5e6e7a2b0b7a8d1f3c4e5f6a7b8c9d0e1f2"
  local queries=(
    "chinese-mountain-mist"
    "ancient-china-landscape"
    "fantasy-nature-forest"
    "dark-mountain-fog"
  )
  local count=$(ls "$DEST_DIR"/fanren-bg-*.jpg 2>/dev/null | wc -l | tr -d ' ')
  count=${count:-4}
  for q in "${queries[@]}"; do
    local result=$(curl -s "https://api.unsplash.com/photos/random?query=$q&orientation=landscape&client_id=$ACCESS_KEY" 2>/dev/null)
    local img_url=$(echo "$result" | grep -oE '"full":"[^"]*"' | head -1 | sed 's/"full":"//;s/"//')
    if [ -n "$img_url" ]; then
      count=$((count + 1))
      local filename="fanren-bg-${count}.jpg"
      echo "  下载: $filename"
      curl -s -L -o "$DEST_DIR/$filename" "${img_url}?w=1920&q=85" || echo "  [跳过] 下载失败"
    fi
    if [ $count -ge 10 ]; then break; fi
  done
}

# --- 方法3: Pexels (免费 API) ---
download_from_pexels() {
  echo "[3/5] 从 Pexels 搜索自然风景..."
  local API_KEY="563492ad6f91700001000001e18889b1f3034d7a8733b7a7e06cc5e5"
  local queries=(
    "misty+mountains"
    "ancient+temple"
    "dark+forest"
    "chinese+garden"
  )
  local count=$(ls "$DEST_DIR"/fanren-bg-*.jpg 2>/dev/null | wc -l | tr -d ' ')
  count=${count:-4}
  for q in "${queries[@]}"; do
    local result=$(curl -s -H "Authorization: $API_KEY" \
      "https://api.pexels.com/v1/search?query=$q&orientation=landscape&size=large&per_page=3" 2>/dev/null)
    local urls=$(echo "$result" | grep -oE '"original":"[^"]*"' | sed 's/"original":"//;s/"//')
    for url in $urls; do
      count=$((count + 1))
      local filename="fanren-bg-${count}.jpg"
      echo "  下载: $filename"
      curl -s -L -o "$DEST_DIR/$filename" "$url" || echo "  [跳过] 下载失败"
      if [ $count -ge 10 ]; then break 2; fi
    done
  done
}

# --- 方法4: Lorem Picsum (兜底) ---
download_fallback() {
  local existing=$(ls "$DEST_DIR"/fanren-bg-*.jpg 2>/dev/null | wc -l | tr -d ' ')
  echo "[兜底] 当前有 ${existing:-0} 张图片"
  if [ "${existing:-0}" -lt 5 ]; then
    echo "  其他源均失败，使用 Lorem Picsum 兜底..."
    for i in $(seq 4 8); do
      if [ ! -f "$DEST_DIR/fanren-bg-$i.jpg" ]; then
        echo "  下载: fanren-bg-$i.jpg"
        curl -s -L -o "$DEST_DIR/fanren-bg-$i.jpg" \
          "https://picsum.photos/1920/1080?random=$i" || true
      fi
    done
  fi
}

# --- 执行 ---
download_from_wallhaven
download_from_unsplash
download_from_pexels
download_fallback

echo ""
echo "=== 完成 ==="
ls -lh "$DEST_DIR"/fanren-bg-*.jpg
