#!/usr/bin/env bash
# Generates app icons from src/assets/logo.svg (requires rsvg-convert)
set -e
cd "$(dirname "$0")/.."
LOGO=$(sed -e 's/<svg [^>]*>//' -e 's/<\/svg>//' src/assets/logo.svg)
mk() { # $1 = padding scale, $2 = rounded radius
cat <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="$2" fill="#FFFDF6"/>
<g transform="translate(256 256) scale($1) translate(-82 -84)">$LOGO</g>
</svg>
SVG
}
mk 2.1 112 > public/icons/icon.svg
mk 1.6 0 > build-maskable.svg
rsvg-convert -w 192 -h 192 public/icons/icon.svg -o public/icons/icon-192.png
rsvg-convert -w 512 -h 512 public/icons/icon.svg -o public/icons/icon-512.png
rsvg-convert -w 1024 -h 1024 public/icons/icon.svg -o public/icons/icon-1024.png
rsvg-convert -w 512 -h 512 build-maskable.svg -o public/icons/icon-maskable-512.png
rm build-maskable.svg
echo "icons done"
