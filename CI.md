# GitHub Actions CI and Jenkins deployment

Each app repository owns `.github/workflows/ci.yml`.
Pull requests to main, feature/** pushes, and manual runs test, build, and scan.
Only a push to main publishes images, after all checks pass.
Jenkins owns deployment; CI does not access production databases or run migrations.
The old backend Render deployment workflow has been removed.

## Configure each GitHub repository

Under Settings -> Secrets and variables -> Actions, add:

| Type | Name | Value |
|---|---|---|
| Variable | DOCKERHUB_USERNAME | Docker Hub login username |
| Variable (optional) | DOCKERHUB_NAMESPACE | Docker Hub organization; defaults to username |
| Secret | DOCKERHUB_TOKEN | Docker Hub access token with permission to push these repositories |

Create Docker Hub repositories in that namespace:
- devsync-frontend
- devsync-main
- devsync-backend-migrate
- devsync-chat

No DB_URL, JWT_SECRET, email, or Cloudinary secrets belong in these CI jobs.
Tests use mocks/test-only values. VITE_API_URL=/api and VITE_CHAT_URL=/chat
are public build defaults, not secrets. Never put secrets in VITE_* variables.
Configure branch protection to require the CI test-build-scan check before merging.
Actions are pinned to commits; review and update pins as releases change.

## Build and release behavior

CI builds linux/amd64 images on an x86 runner. Use an x86 EC2 instance for this
phase; ARM/Graviton requires a separate build strategy.
Trivy blocks publication for HIGH or CRITICAL OS/library vulnerabilities,
including those without a published fix. Reports are retained for 14 days.
A failing scan needs investigation and remediation; do not bypass it to release.
Frontend tests cover proxy socket endpoints; chat tests cover JWT verification;
backend runs the existing Jest suite. These are unit checks, not end-to-end tests.

The exact locally scanned images are tagged and pushed, without rebuilding.
Tags include the commit SHA, workflow run ID, and attempt so a rerun gets a new tag.
A successful publishing run produces a `release-<service>-<sha>` artifact containing
`release.env` with the immutable image digest, commit and tag. Backend includes the
matching migration image digest. No `latest` tag is published.
If either backend image fails to publish, there is no completed release artifact;
do not deploy a partial backend release just because an image exists in Docker Hub.

## Jenkins and environment variables

On the deployment server, keep two separate files outside Git:

- `/opt/devsync/runtime.env`: DB_URL, REDIS_URL, MONGO_URI, JWT_SECRET,
  FRONTEND_URL, PUBLIC_FRONTEND_URL, email and Cloudinary credentials, etc.
  Restrict permissions to the deployment account (for example chmod 600).
- `/opt/devsync/release.env`: FRONTEND_IMAGE, BACKEND_IMAGE, CHAT_IMAGE,
  BACKEND_MIGRATION_IMAGE as registry@sha256 references for the whole stack.

Jenkins merges only the selected service's references from a successful CI artifact
into the server release record. It must retain the other services' current references
and save the previous full record for rollback. Do not overwrite the entire release
record with a single service artifact. Artifacts expire after 30 days; persist approved
release history on the deployment side.

Jenkins credentials hold deployment access and a pull-only registry token if private
images are used. CI holds the push token. Runtime secrets stay on the server (or a
secret manager), never inside images or release artifacts.

The deployment Compose file must use `image: ${BACKEND_IMAGE}` etc., not `build:`.
For Compose variable interpolation, deployment would use:

```bash
docker compose --env-file /opt/devsync/runtime.env \
  --env-file /opt/devsync/release.env -f compose.prod.yml up -d --no-deps backend
```

The production Compose file must explicitly pass each needed variable through
`environment:` or a service `env_file:`. CLI `--env-file` alone does not inject every
variable into containers. Keep internal URLs such as http://chat:4000 and
http://backend:5000; public origins point at the server/domain.

## Next deployment step

The current root Compose remains the local build setup. Production Compose and the
Jenkins deployment job are not implemented by this CI change. Jenkins must pull the
selected images, run the backend migration image before a backend release, update
only the selected service, check health, and record/rollback releases.
No Jenkins webhook is enabled yet; configure the CI-to-Jenkins trigger once the job
and authenticated endpoint exist. For now the release artifact is the handoff.

References: https://docs.docker.com/guides/gha/ and
https://github.com/aquasecurity/trivy-action
