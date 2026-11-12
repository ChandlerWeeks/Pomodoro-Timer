# Focal startup service

## Automatic deployment

`.github/workflows/main.yml` builds the frontend, tests the API, and validates the
production Compose configuration on every push to `main`. Once checks pass, its
deploy job advances the `production` branch to that exact commit.

A user systemd timer on this machine checks that branch every 30 seconds. It
fast-forwards this checkout, builds the frontend into a temporary directory,
builds the backend image, publishes the frontend, and recreates the production
containers. Music data and `.env` stay on the host. Source edits that would be
overwritten, staged changes, and a checkout ahead of the approved commit stop
deployment instead of being discarded. Commit and push application edits made
on this machine; do not manually pull commits that have not passed CI.

After local health checks pass, the server publishes the deployed commit at
`/.well-known/focal-deployment.json`. The Actions deploy job waits for that commit
and checks the public homepage and API before reporting success. No incoming SSH
access, repository secrets, or self-hosted Actions runner is required. Only
commits approved by the Actions workflow should be pushed to `production`.

Install or refresh the watcher from the checkout:

```sh
bash deploy/install-watcher.sh
```

The installer captures the current Node executable directory for systemd's
PATH. Run it again after removing or changing the host's Node installation, or
after updating the watcher script. Node 24.12+ or 26 is supported by the current
frontend toolchain. Docker, Compose, Git, curl, rsync, flock, and repository read
access are required. This host has user lingering enabled so the timer starts
after reboot without an interactive login. On another host, enable it with
`sudo loginctl enable-linger "$USER"`.

Inspect or stop automatic deployment:

```sh
systemctl --user status focal-deploy.timer focal-deploy.service
journalctl --user -u focal-deploy.service -n 100 --no-pager
systemctl --user stop focal-deploy.timer
```

Build or health-check failures appear in the journal and cause Actions to time
out rather than report success. There is no automatic rollback; revert the bad
change on `main` and push the revert through the same checks.

## Boot service

`focal.service` starts the production Compose stack on boot and stops it during
shutdown. It is configured for user `jweeks12` and the checkout at
`/home/jweeks12/Focal/Pomodoro-Timer`. Update `User`, `WorkingDirectory`,
`RequiresMountsFor`, and `ExecStartPre` if moving the application.

The service starts the existing frontend build and Docker images. Prepare them
from the repository root before enabling the service:

```sh
npm --prefix frontend-client run build
docker compose -f compose.production.yaml up --build -d --wait
```

The service account needs Docker access (on this machine it belongs to the
`docker` group). Put any persistent `MUSIC_DATA_DIR` setting in the repository's
`.env` file so systemd uses the same data directory as interactive deployments.
The checkout, `frontend-client/dist`, `nginx.conf`, and music directory must
remain available after reboot.

Install and enable from the repository root:

```sh
sudo install -m 644 deploy/focal.service /etc/systemd/system/focal.service
sudo systemctl daemon-reload
sudo systemctl enable --now focal.service
```

Cloudflare Tunnel runs independently through the existing enabled
`cloudflared.service` and can reconnect while the application starts. No tunnel
restart is needed when installing this unit.

Check startup and public access:

```sh
systemctl status focal.service --no-pager
journalctl -u focal.service -b --no-pager
docker compose -f compose.production.yaml ps
curl --fail https://usefocal.net/api/playlists/
```

`active (exited)` is expected because Compose starts the containers in the
background. Docker's container restart policies handle process crashes;
systemd's unit status records whether the Compose startup completed.

Manage the stack with `sudo systemctl start focal`, `stop focal`, or
`restart focal`. Stopping the unit stops the application containers. To disable
startup and stop the application, use `sudo systemctl disable --now focal`.

To deploy future code updates, run the two build/start commands above from the
repository root. They rebuild and apply the application while preserving its
music data. Boot uses `--no-build --pull never` so it can start existing images
without downloading dependencies. After a planned reboot, repeat the status
and HTTP checks to verify startup on this host.
