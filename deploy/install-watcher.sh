#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
service_dir="$HOME/.config/systemd/user"
script_dir="$HOME/.local/lib/focal"
node_dir="$(dirname "$(command -v node)")"
mkdir -p "$service_dir" "$script_dir"
install -m 755 "$root/deploy/watch-production.sh" "$script_dir/watch-production.sh"

cat > "$service_dir/focal-deploy.service" <<UNIT
[Unit]
Description=Deploy the Pomodoro commit approved by GitHub Actions
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=$root
Environment="FOCAL_ROOT=$root"
Environment="PATH=$node_dir:/usr/local/bin:/usr/bin:/bin"
Environment=GIT_TERMINAL_PROMPT=0
Environment="GIT_SSH_COMMAND=ssh -o BatchMode=yes -o ConnectTimeout=15"
ExecStart=$script_dir/watch-production.sh
TimeoutStartSec=15min
UMask=0022
UNIT

cat > "$service_dir/focal-deploy.timer" <<'UNIT'
[Unit]
Description=Check for an approved Pomodoro deployment every 30 seconds

[Timer]
OnBootSec=45s
OnUnitInactiveSec=30s
AccuracySec=5s
Unit=focal-deploy.service

[Install]
WantedBy=timers.target
UNIT

systemctl --user daemon-reload
systemctl --user enable --now focal-deploy.timer
echo 'Deployment watcher enabled. Logs: journalctl --user -u focal-deploy.service'
