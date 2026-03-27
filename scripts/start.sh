#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

setup_env() {
	local dir="$1"
	if [[ ! -f "$dir/.env" ]]; then
		echo "  Creating $dir/.env from .env.example..."
		cp "$dir/.env.example" "$dir/.env"
		echo "  ⚠️  Edit $dir/.env before running in production!"
	fi
}

install_deps() {
	local dir="$1"
	echo "  Installing dependencies in $dir..."
	(cd "$dir" && bun install --production --frozen-lockfile 2>/dev/null || bun install --production)
}

install_bun() {
	echo "  Installing bun..."
	curl -fsSL https://bun.sh/install | bash
	# reload PATH for current session
	export PATH="$HOME/.bun/bin:$PATH"
	if ! command -v bun &>/dev/null; then
		echo "  ❌ bun install failed. Install manually: https://bun.sh"
		exit 1
	fi
	echo "  ✅ bun $(bun --version) installed"
}

detect_pkg_manager() {
	if command -v apt-get &>/dev/null; then echo "apt"
	elif command -v dnf &>/dev/null;    then echo "dnf"
	elif command -v pacman &>/dev/null; then echo "pacman"
	elif command -v brew &>/dev/null;   then echo "brew"
	else echo ""
	fi
}

install_pkg() {
	local pkg="$1"
	local pm
	pm="$(detect_pkg_manager)"

	case "$pm" in
		apt)    sudo apt-get install -y "$pkg" ;;
		dnf)    sudo dnf install -y "$pkg" ;;
		pacman) sudo pacman -S --noconfirm "$pkg" ;;
		brew)   brew install "$pkg" ;;
		*)
			echo "  ❌ No supported package manager found. Install $pkg manually."
			return 1
			;;
	esac
}

install_ytdlp() {
	echo "  Installing yt-dlp..."
	# prefer pip if available, otherwise fall back to pkg manager
	if command -v pip3 &>/dev/null; then
		pip3 install -q --user yt-dlp
		export PATH="$HOME/.local/bin:$PATH"
	elif command -v pip &>/dev/null; then
		pip install -q --user yt-dlp
		export PATH="$HOME/.local/bin:$PATH"
	else
		install_pkg yt-dlp
	fi

	if ! command -v yt-dlp &>/dev/null; then
		echo "  ❌ yt-dlp install failed. Install manually: https://github.com/yt-dlp/yt-dlp#installation"
		exit 1
	fi
	echo "  ✅ yt-dlp $(yt-dlp --version) installed"
}

check_deps() {
	echo "Checking dependencies..."
	echo ""

	if ! command -v bun &>/dev/null; then
		echo "  bun not found — installing..."
		install_bun
	else
		echo "  ✅ bun $(bun --version)"
	fi

	if ! command -v ffmpeg &>/dev/null; then
		echo "  ffmpeg not found — installing..."
		install_pkg ffmpeg && echo "  ✅ ffmpeg installed" || exit 1
	else
		echo "  ✅ ffmpeg $(ffmpeg -version 2>&1 | awk 'NR==1{print $3}')"
	fi

	if ! command -v yt-dlp &>/dev/null; then
		echo "  yt-dlp not found — installing..."
		install_ytdlp
	else
		echo "  ✅ yt-dlp $(yt-dlp --version)"
	fi

	echo ""
}

echo "=== Lalasynth Setup ==="
echo ""
check_deps

for app in api master; do
	dir="$SCRIPT_DIR/$app"
	if [[ ! -d "$dir" ]]; then continue; fi
	echo "[$app]"
	setup_env "$dir"
	install_deps "$dir"
	echo ""
done

echo "=== Starting servers ==="
echo ""
echo "Starting api  on http://localhost:3000"
echo "Starting master on http://localhost:5000"
echo ""

(cd "$SCRIPT_DIR/api" && bun dist/index.js) &
PID_API=$!

(cd "$SCRIPT_DIR/master" && bun dist/index.js) &
PID_MASTER=$!

trap "kill $PID_API $PID_MASTER 2>/dev/null; exit" INT TERM

wait $PID_API $PID_MASTER