#!/usr/bin/env bash
# ============================================================
# fetch-media.sh — localize all media for production.
# Run on YOUR machine (needs internet + curl + ffmpeg, both standard).
# Downloads the hotlinked stock photos, makes WebP/AVIF, builds the hero
# video, and (optionally) repoints index.html to the local files.
#
#   bash scripts/fetch-media.sh                 # download + convert images
#   bash scripts/fetch-media.sh --localize-html # also rewrite index.html to local paths
#   (drop a clip at scripts/hero-raw.mp4 first to build the hero video)
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."
IMG=assets/img
VID=assets/video
mkdir -p "$IMG" "$VID"

command -v curl  >/dev/null || { echo "curl not found";  exit 1; }
command -v ffmpeg >/dev/null || echo "WARNING: ffmpeg not found — skipping WebP/AVIF/video"

# slot -> unsplash photo id  (keep in sync with index.html + MEDIA-CREDITS.md)
slots=(
  "hero:1561758033-d89a9ad46330:1600"
  "doner-chicken-wrap:1633321702518-7feccafb94d5:800"
  "doner-beef-plate:1601050690597-df0568f70950:800"
  "doner-mixed:1610057099443-fde8c4d50f91:800"
  "burger-classic:1568901346375-23c9450c58cd:800"
  "burger-cheese:1550547660-d9450f859349:800"
  "burger-double:1586190848861-99aa4a171e90:800"
  "burger-chicken:1606755962773-d324e0a13086:800"
  "wrap-chicken:1626700051175-6818013e1d4f:800"
  "wrap-beef:1562967914-608f82629710:800"
  "fries:1573080496219-bb080dd4f877:800"
  "onion-rings:1639024471283-03518883512d:800"
  "ayran:1550583724-b2692b85b150:800"
  "soft-drink:1581636625402-29b2a704ef13:800"
  "water:1560023907-5f339617ea30:800"
  "gallery-grill:1544025162-d76694265947:900"
  "gallery-spit:1529006557810-274b9b2fc783:800"
  "gallery-burger:1571091718767-18b5b1457add:600"
  "gallery-taksim:1524231757912-21f4fe3a7200:600"
  "gallery-street:1565299624946-b28f40a0ae38:600"
  "gallery-guests:1414235077428-338989a2e8c0:900"
)

echo "==> Downloading photos..."
for s in "${slots[@]}"; do
  IFS=":" read -r slot id w <<< "$s"
  url="https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85"
  echo "   $slot.jpg"
  curl -fSL --retry 2 -o "$IMG/$slot.jpg" "$url" || echo "   ! failed: $slot (keep SVG fallback)"
  if command -v ffmpeg >/dev/null && [ -f "$IMG/$slot.jpg" ]; then
    ffmpeg -y -loglevel error -i "$IMG/$slot.jpg" -c:v libwebp -q:v 80 "$IMG/$slot.webp" || true
    ffmpeg -y -loglevel error -i "$IMG/$slot.jpg" -c:v libaom-av1 -crf 30 -b:v 0 -still-picture 1 "$IMG/$slot.avif" 2>/dev/null || true
  fi
done

# og-image (1200x630) cropped from the hero photo
if command -v ffmpeg >/dev/null && [ -f "$IMG/hero.jpg" ]; then
  echo "==> og-image.jpg"
  ffmpeg -y -loglevel error -i "$IMG/hero.jpg" -vf "scale=1200:-1,crop=1200:630" "$IMG/og-image.jpg" || true
fi

# hero video — needs a raw clip at scripts/hero-raw.mp4 (see MEDIA-CREDITS.md)
if command -v ffmpeg >/dev/null && [ -f scripts/hero-raw.mp4 ]; then
  echo "==> Encoding hero video (12s loop, muted)..."
  ffmpeg -y -loglevel error -i scripts/hero-raw.mp4 -t 12 -an -vf "scale=1920:-2" -c:v libx264 -crf 24 -movflags +faststart "$VID/hero-1080.mp4"
  ffmpeg -y -loglevel error -i scripts/hero-raw.mp4 -t 12 -an -vf "scale=1920:-2" -c:v libvpx-vp9 -b:v 0 -crf 34 "$VID/hero-1080.webm"
  ffmpeg -y -loglevel error -i "$VID/hero-1080.mp4" -ss 1 -frames:v 1 "$IMG/hero-poster.jpg"
  echo "   wrote $VID/hero-1080.mp4 + .webm + hero-poster.jpg"
else
  echo "==> No scripts/hero-raw.mp4 — skipping video (hero keeps its poster image)."
fi

# optional: rewrite index.html hotlinks -> local files
if [ "${1:-}" = "--localize-html" ]; then
  echo "==> Repointing index.html to local images..."
  cp index.html index.html.bak
  for s in "${slots[@]}"; do
    IFS=":" read -r slot id w <<< "$s"
    # replace the whole unsplash URL for this photo id with the local jpg
    perl -0pi -e "s#https://images\\.unsplash\\.com/photo-${id}\\?[^\"]*#assets/img/${slot}.jpg#g" index.html
  done
  # point hero poster + video poster to the generated jpg if present
  [ -f "$IMG/hero-poster.jpg" ] && perl -0pi -e 's#poster="assets/hero.svg"#poster="assets/img/hero-poster.jpg"#' index.html
  echo "   done (backup at index.html.bak)."
  echo "   TIP: for AVIF/WebP + srcset, swap each <img src> for a <picture> using the .avif/.webp now in $IMG."
fi

echo "==> Done."
