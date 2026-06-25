#!/usr/bin/env bash
# ============================================================
# make-og.sh — build assets/og-image.jpg (1200x630) for social/WhatsApp previews.
# Real food photo (free-license Unsplash) + dark scrim + brand title, via ffmpeg.
# No AI imagery. Needs: curl + ffmpeg (drawtext/libfreetype). Run from repo root or scripts/.
#
#   bash scripts/make-og.sh
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."
command -v curl   >/dev/null || { echo "curl not found"; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found"; exit 1; }

SRC="https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&h=630&q=80"
TMP_IMG=".og-src.jpg"
FONT_SRC="/c/Windows/Fonts/segoeuib.ttf"   # Poppins-style fallback (Segoe UI Bold) — has Turkish glyphs
FONT="./.ogfont.ttf"
T1=".og-title.txt"
T2=".og-sub.txt"

echo "==> downloading hero photo (1200x630)"
curl -fSL --retry 2 -o "$TMP_IMG" "$SRC"

# local font copy so ffmpeg's filter parser never sees a Windows drive-colon path
cp "$FONT_SRC" "$FONT"
printf '%s' "Taksim Döner & Burger" > "$T1"
printf '%s' "7/24 · Taksim Meydanı" > "$T2"

echo "==> compositing scrim + title"
ffmpeg -y -loglevel error -i "$TMP_IMG" -vf "\
drawbox=x=0:y=0:w=1200:h=630:color=black@0.32:t=fill,\
drawbox=x=0:y=300:w=1200:h=330:color=black@0.42:t=fill,\
drawtext=fontfile=${FONT}:textfile=${T1}:fontcolor=white:fontsize=78:x=(w-text_w)/2:y=300:shadowcolor=black@0.65:shadowx=0:shadowy=3,\
drawtext=fontfile=${FONT}:textfile=${T2}:fontcolor=0xF5A623:fontsize=42:x=(w-text_w)/2:y=410:shadowcolor=black@0.6:shadowx=0:shadowy=2,\
drawbox=x=(iw-360)/2:y=392:w=360:h=4:color=0xE23744:t=fill" \
  -frames:v 1 -q:v 3 assets/og-image.jpg

rm -f "$TMP_IMG" "$FONT" "$T1" "$T2"
echo "==> wrote assets/og-image.jpg"
ls -l assets/og-image.jpg
