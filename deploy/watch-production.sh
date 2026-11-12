#!/usr/bin/env bash
set -euo pipefail

root="${FOCAL_ROOT:-/home/jweeks12/Focal/Pomodoro-Timer}"
cd "$root"
mkdir -p .deploy
exec 9>.deploy/production.lock
flock -n 9 || exit 0

# Actions advances production only after checks succeed.
target="$(git ls-remote --heads origin refs/heads/production | awk '{print $1}')"
[[ "$target" =~ ^[0-9a-f]{40}$ ]] || exit 0
if [[ -f .deploy/deployed-sha ]] && [[ "$(cat .deploy/deployed-sha)" == "$target" ]]; then
  exit 0
fi

git fetch origin refs/heads/production
if [[ "$(git rev-parse FETCH_HEAD)" != "$target" ]]; then
  echo 'Production changed while fetching; retrying on the next timer tick.'
  exit 0
fi

# Never reset, stash, or discard work in the checkout.
git merge --ff-only "$target"
if [[ "$(git rev-parse HEAD)" != "$target" ]]; then
  echo 'Checkout is ahead of the approved commit; refusing to deploy untested code.' >&2
  exit 1
fi
if ! git diff --quiet -- frontend-client backend/music_api ':!backend/music_api/data' \
  compose.production.yaml nginx.conf; then
  echo 'Application files have local changes; commit and push them before deploying.' >&2
  exit 1
fi
if ! git diff --cached --quiet; then
  echo 'Checkout has staged changes; refusing to deploy.' >&2
  exit 1
fi

echo "Building production commit $target"
staging="$(mktemp -d "$root/.deploy/frontend.XXXXXX")"
trap 'rm -rf -- "$staging"' EXIT

npm ci --prefix frontend-client
npm --prefix frontend-client run build -- --outDir "$staging"
docker compose -f compose.production.yaml build backend

# Preserve the bind-mounted dist directory; publish assets before index.html.
mkdir -p frontend-client/dist
rsync -a --exclude=index.html --exclude=.well-known "$staging/" frontend-client/dist/
install -m 644 "$staging/index.html" frontend-client/dist/.index.html.next
mv -f frontend-client/dist/.index.html.next frontend-client/dist/index.html

# Recreate Nginx too so its upstream resolves the new backend address.
docker compose -f compose.production.yaml up \
  --no-build --force-recreate -d --wait --wait-timeout 120

for url in http://127.0.0.1:8080/ http://127.0.0.1:8080/api/playlists/; do
  curl --fail --silent --show-error --max-time 30 \
    --retry 5 --retry-delay 3 --retry-all-errors "$url" > /dev/null
done

# Acknowledge the commit only after the application passes its checks.
mkdir -p frontend-client/dist/.well-known
printf '{"sha":"%s"}\n' "$target" > frontend-client/dist/.well-known/.deployment.next
chmod 644 frontend-client/dist/.well-known/.deployment.next
mv -f frontend-client/dist/.well-known/.deployment.next \
  frontend-client/dist/.well-known/focal-deployment.json
printf '%s\n' "$target" > .deploy/deployed-sha.next
mv -f .deploy/deployed-sha.next .deploy/deployed-sha
echo "Successfully deployed $target"
