#!/usr/bin/env bash
set -euo pipefail

PLATFORMS=(linux linux-arm64 windows macos macos-x64)
APPS=(api master)

# Allow filtering via args: ./build-binaries.sh api linux
TARGET_APPS=("${@:-${APPS[@]}}")
# If second arg looks like a platform, filter platforms too
if [[ "${2:-}" != "" ]]; then
	PLATFORMS=("$2")
	TARGET_APPS=("$1")
fi

echo "🔨 Building binaries for apps: ${TARGET_APPS[*]}"
echo "🎯 Platforms: ${PLATFORMS[*]}"
echo ""

FAILED=0

for app in "${TARGET_APPS[@]}"; do
	dir="apps/$app"

	if [[ ! -d "$dir" ]]; then
		echo "⚠️  App '$app' not found, skipping"
		continue
	fi

	echo "━━━ $app ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

	for platform in "${PLATFORMS[@]}"; do
		printf "  %-14s → " "$platform"
		if (cd "$dir" && bun run build.ts --bin "$platform" 2>&1 | tail -1); then
			: # success message already printed by build.ts
		else
			echo "❌ FAILED"
			FAILED=$((FAILED + 1))
		fi
	done

	echo ""
done

if [[ $FAILED -gt 0 ]]; then
	echo "❌ $FAILED build(s) failed"
	exit 1
fi

echo "✅ All binaries built"
echo ""
echo "Output locations:"
for app in "${TARGET_APPS[@]}"; do
	[[ -d "apps/$app/dist/bin" ]] && ls -lh "apps/$app/dist/bin/"
done