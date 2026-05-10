# Releasing

How to cut a release of `@deathbycode/civitas-id-core` and `@deathbycode/civitas-id-sweden`. Read this end-to-end before your first release — the npm publish step has version-specific traps.

## Hard prerequisites

- **GitHub Actions runners must use Node 24+.** The publish workflow uses [npm OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers/), which requires **npm ≥ 11.5.1**. Node 22 LTS ships npm 10.x and **cannot publish**. Verify `.github/workflows/publish.yml` has `node-version: "24"`.
- **Trusted publisher must be configured on npmjs.com** for each package. Settings → "Trusted Publishers" must list this repo and the `Publish to npm` workflow filename. If you forgot, the publish step fails with a 4xx auth error.
- **`id-token: write`** must be granted in the workflow's `permissions:` block. The OIDC token mint requires it.
- **No `NPM_TOKEN` secret should be set.** OIDC activates only when `NODE_AUTH_TOKEN` is absent. If a token exists, npm 11 prefers token auth.

## Branch flow (gitflow)

```
feature/* ──┐
bugfix/*  ──┤       ┌──► PR to develop
chore/*   ──┤
spike/*   ──┘
                    ↓
                 develop ──► release/vX.Y.Z ──► PR to master ──► tag vX.Y.Z
                                                     │
                                                     └──► back-merge master → develop
```

- Feature/bugfix/chore branches target `develop`.
- When `develop` is feature-complete for a release, cut `release/vX.Y.Z` from `develop`.
- `release/vX.Y.Z` exists for last-minute version-bump / CHANGELOG edits only — no new features.
- PR `release/vX.Y.Z` → `master`. Merge creates the release commit on `master`.
- Tag `vX.Y.Z` annotated on the merge commit. Push the tag.
- Back-merge `master` → `develop` to propagate any release-branch fixes.

## Pre-release checklist

Before opening the release PR to master:

- [ ] Both `packages/core/package.json` and `packages/sweden/package.json` bumped to the new version.
- [ ] `publishConfig: { access: public, provenance: true }` present on both `package.json` files.
- [ ] `CHANGELOG.md` has an entry for the new version, dated `YYYY-MM-DD`, with sections matching prior releases (Added / Fixes / BREAKING CHANGES if applicable).
- [ ] For major versions: README(s) carry a "vX.0.0 (breaking)" callout near the top listing removed/changed API.
- [ ] `pnpm -r test && pnpm -r typecheck && pnpm -r build && pnpm lint` all clean locally.
- [ ] CI green on `develop`.

## Cutting the release

```bash
git checkout develop
git pull origin develop

git checkout -b release/v2.1.0           # adjust version
git push -u origin release/v2.1.0

gh pr create --base master --head release/v2.1.0 \
  --title "Release v2.1.0" \
  --body "Release v2.1.0 — <summary>. See CHANGELOG.md for details."
```

Wait for CI to pass, then merge:

```bash
gh pr merge <PR#> --merge --delete-branch
```

## Tagging

After the release PR merges to `master`:

```bash
git checkout master
git pull origin master

git tag -a v2.1.0 -m "v2.1.0 — <one-line summary>

<short paragraph or bullet list of headline changes>

See CHANGELOG.md for full details."

git push origin v2.1.0
```

Tags MUST be **annotated** (`-a`), not lightweight. Use the SemVer `vMAJOR.MINOR.PATCH` form.

## GitHub release

```bash
gh release create v2.1.0 --title "v2.1.0" --notes-file <notes-file>
```

Release-note format mirrors v1.0.x / v2.0.0 — sectioned (Packages / Breaking changes / Added / Fixes), each item links its tracking issue, closes with a link to `CHANGELOG.md`.

Publishing the release fires the `Publish to npm` workflow.

## What the publish workflow does

`release: published` → workflow checks out the tagged commit → `pnpm install` → build → test → `pnpm -r publish --provenance --access public --no-git-checks`. Provenance attestations are signed via Sigstore against the GitHub OIDC token.

Successful publish emits these markers in the log:

```
npm notice Publishing to https://registry.npmjs.org/ with tag latest and public access
npm notice publish Signed provenance statement with source and build information from GitHub Actions
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=...
```

## Back-merge to develop

After the master merge and tagging:

```bash
git checkout develop
git pull origin develop
git merge --no-ff origin/master -m "Merge tag 'v2.1.0' into develop"
git push origin develop
```

This propagates any release-branch fixups (rare — most of the time release branch is identical to develop at the cut point) and keeps the gitflow back-merge audit trail intact.

## Post-publish verification

```bash
# Both should report the new version
npm view @deathbycode/civitas-id-core version
npm view @deathbycode/civitas-id-sweden version

# Provenance attestation URLs
npm view @deathbycode/civitas-id-core@<version> dist.attestations
npm view @deathbycode/civitas-id-sweden@<version> dist.attestations
```

The Sigstore transparency log URL in the workflow output is publicly browsable — handy for downstream security audits.

## Recovering from a failed publish

If the `Publish to npm` workflow fails:

1. **Diagnose** the failure in the run logs. Common causes:
   - Trusted publisher not configured on npmjs.com → fix in npm settings, re-run.
   - `NPM_TOKEN` secret accidentally added → delete the secret, re-run.
   - npm version mismatch / OIDC unsupported → check `Node 24+` is in use; see "Hard prerequisites" above.
   - Network / sigstore transient errors → re-run.

2. **Re-run** without recreating the GitHub release. The workflow has a `workflow_dispatch` trigger with a `ref` input:
   ```bash
   gh workflow run "Publish to npm" --ref master --field ref=v2.1.0
   ```
   This re-publishes against the existing tag.

3. **Recreating the GitHub release** is a last resort. Each `release: published` event fires the workflow, but it also rewrites the release timestamp and breaks the audit trail.

## Hotfixes

For production defects discovered after a release:

```
master ──► hotfix/<topic> ──► PR to master ──► tag vX.Y.Z+1
                                    │
                                    └──► back-merge master → develop
```

- Hotfix branches come from `master` (not `develop`).
- Same tag + release + back-merge sequence as a normal release.
- If a `release/*` branch is open at the time, merge the hotfix into the release branch instead of `develop` — it reaches `develop` when the release branch back-merges.

## Version bumping

Both packages are published in lockstep at the same version. When bumping:

- **PATCH** (`2.0.0` → `2.0.1`): backward-compatible bug fix only.
- **MINOR** (`2.0.0` → `2.1.0`): backward-compatible feature addition.
- **MAJOR** (`2.0.0` → `3.0.0`): any removal/rename/behavior change to the public API of either package.

`packages/sweden` depends on `packages/core` via `workspace:*`, so the in-repo dep is automatic. The published sweden tarball gets the core version pinned at publish time.

## Trusted publisher setup (one-time per package)

If you ever need to set up trusted publishing for a new package:

1. Publish the package once via legacy `NPM_TOKEN` (or by manual `pnpm publish` from local).
2. Go to https://www.npmjs.com/package/<pkg>/access → "Trusted Publishers" → "Add Trusted Publisher".
3. Select GitHub Actions, enter:
   - Repository owner: `crippledgeek`
   - Repository name: `civitas-id`
   - Workflow filename: `publish.yml`
   - Environment name: (leave blank unless using deployment environments)
4. Save. Next publish via this workflow uses OIDC; you can delete `NPM_TOKEN`.

## Past trips

Documenting failures so we don't repeat them:

- **v2.0.0** — initial publish failed at `npm install -g npm@latest` (broken on Node 22.22.2 runner image, [npm/cli#9151](https://github.com/npm/cli/issues/9151)). Two hotfixes ([#17](https://github.com/crippledgeek/civitas-id/pull/17), [#18](https://github.com/crippledgeek/civitas-id/pull/18)) removed the self-upgrade and bumped the workflow to Node 24. **Lesson**: don't rely on `npm install -g npm@latest`; pin a Node version whose bundled npm already meets the OIDC trusted-publishing floor (≥11.5.1).
