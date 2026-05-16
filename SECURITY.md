# Security Policy

## Reporting a Vulnerability

Email: huy.nguyen@techcoop.vn

Do **not** open public issues for security bugs. Allow 7 days for response before disclosure.

## Secret Leak Prevention

This repo is public. **Never commit secrets** (passwords, tokens, private keys, API keys, DB credentials, OAuth client secrets).

Defense layers (all active):

| Layer | Mechanism | Effect |
|-------|-----------|--------|
| 1 | `.gitignore` | Blocks tracking of `.env`, `*.db`, `*.pem`, `*.key`, backups |
| 2 | `pre-commit` hooks (`gitleaks` + `detect-secrets`) | Block commit locally if secret pattern detected |
| 3 | GitHub Push Protection | Server rejects push containing known token formats |
| 4 | CI workflow `secret-scan.yml` (`gitleaks` + `trufflehog`) | PR fails if secret found |
| 5 | Branch protection on `main` | No force-push, no direct push, PR required, status checks required |
| 6 | Dependabot security updates | Auto PRs for vulnerable dependencies |

### Required local setup (every contributor, every clone)

```bash
# install pre-commit + tools
uv tool install pre-commit
pre-commit install
pre-commit install --hook-type pre-push

# initial baseline for detect-secrets (run once after fresh clone)
uv tool install detect-secrets
detect-secrets scan > .secrets.baseline
```

### Hardening checklist (one-time, repo admin)

GitHub UI → Settings → Code security → enable:

- [x] Dependency graph
- [x] Dependabot alerts
- [x] Dependabot security updates
- [x] Secret scanning
- [x] Push protection
- [ ] **Secret scanning — non-provider patterns** (UI only, API does not flip on free tier)
- [ ] **Secret scanning — validity checks** (UI only)

### What to do if you accidentally commit a secret

1. **Rotate the secret immediately** — assume it is compromised the moment it touched git.
2. Do **not** just `git commit --amend` or `git revert` — secret stays in history.
3. Remove from history:
   ```bash
   git filter-repo --path path/to/file --invert-paths
   git push --force-with-lease origin main
   ```
   (Requires temporarily disabling branch protection. Coordinate with admin.)
4. Notify team. Document rotation in PR.

### What never to do

- ❌ `git push --no-verify` (skips pre-commit — but server still blocks known formats)
- ❌ Commit `.env`, `*.pem`, real `*.db` files
- ❌ Hardcode credentials in source files
- ❌ Paste secrets into issue/PR comments
- ❌ Disable secret-scan workflow

### Where to store secrets

| Where | What |
|-------|------|
| `backend/.env` (gitignored) | Local dev creds — never commit |
| GitHub Actions Secrets | CI/CD creds |
| Production env vars / secret manager | Production creds |
| `backend/.env.example` (committed) | Placeholder keys only, no real values |
