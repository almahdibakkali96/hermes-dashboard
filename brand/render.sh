#!/usr/bin/env bash
# Re-export the ArabTides brand PNGs from the HTML sources in brand/src.
# Usage (from Git Bash):  bash brand/render.sh
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
PROFILE="$(mktemp -d)"
ROOT="$(pwd -W 2>/dev/null || pwd)"
SRC="file:///$ROOT/src"

shot() { # shot <html> <query> <width> <height> <out.png>
  "$CHROME" --headless=new --user-data-dir="$PROFILE" --hide-scrollbars --force-device-scale-factor=1 --default-background-color=00000000 \
    --virtual-time-budget=6000 --window-size="$3,$4" --screenshot="$ROOT/$5" "$SRC/$1?$2" 2>/dev/null
  echo "  $5"
}

echo "Instagram — launch carousel"
for i in 1 2 3 4 5 6 7; do shot ig-01-launch.html "s=$i" 1080 1350 "instagram/01-launch/slide-$i.png"; done

if [ -f src/ig-02-full-moon.html ]; then
  echo "Instagram — full moon carousel"
  for i in 1 2 3 4 5 6 7; do shot ig-02-full-moon.html "s=$i" 1080 1350 "instagram/02-full-moon/slide-$i.png"; done
fi

if [ -f src/profile.html ]; then
  echo "Profile picture"
  shot profile.html "" 1080 1080 "instagram/00-profile-picture.png"
fi

if [ -f src/logos.html ]; then
  echo "Logos"
  shot logos.html "v=mark" 1024 1024 "logo/arabtides-mark-1024.png"
  shot logos.html "v=horizontal-dark" 1800 600 "logo/arabtides-logo-on-navy.png"
  shot logos.html "v=horizontal-light" 1800 600 "logo/arabtides-logo-on-white.png"
fi

if [ -f src/brand-guide.html ]; then
  echo "Brand guide"
  shot brand-guide.html "" 1600 2600 "brand-guide.png"
fi
rm -rf "$PROFILE"
