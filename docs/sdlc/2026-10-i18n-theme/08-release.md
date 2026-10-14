# 08 · Release — 2026-10-i18n-theme

> Owner: devops-engineer (haiku) · 2026-10-14
> Status: **READY, NOT DEPLOYED.** Nothing committed, pushed or deployed. Waiting for human approval.

- **Version:** `0.1.0` → `0.2.0` (feat → minor). Bumped in `package.json` and `package-lock.json`.
- **CI run:** not run on GitHub yet (no push at this stage). Local equivalents of each gate, in CI order:

| Gate | Command | Result |
|---|---|---|
| 1 agents | `npm run agents:check` | PASS. 10 agents, 7 phases, pins match |
| 2 typecheck | `npm run typecheck` | exit 0. Prints a Vue plugin warning, see open item 6 |
| 3 generate | `npm run generate` | exit 0. 44 routes prerendered, 21 `index.html` (3 locales x home + 6 projects), `404.html`, `200.html` |
| 4 e2e | `npm run test:e2e` | 85 passed, 2 skipped (mobile-only tests on desktop projects), 0 failed |

- **Deploy target:** GitHub Pages (static `.output/public`), custom domain `https://3dot.uz`.
  - The default `github.io` project URL will NOT work. The site uses root-absolute asset paths (`/_nuxt/...`) and `baseURL: /`. Serve it from the custom domain only.
- **Env vars:** none. The app reads no `process.env` / `import.meta.env`. `SITE_URL` is a constant in `app/data/site.ts`. CI needs no secrets. The deploy job uses the built-in `GITHUB_TOKEN` with `pages: write` and `id-token: write`, declared in `deploy.yml`. Playwright reads `CI`, which GitHub sets automatically.
- **Rollback:** see the Rollback section below.

## Workflows added (devops-engineer)

- `.github/workflows/ci.yml`: triggers are push and PR to `main`, plus `workflow_call`. Node 22, `npm ci`, then `agents:check` → `typecheck` → `generate` → `playwright install --with-deps chromium` → `test:e2e`. On failure it uploads `playwright-report/`.
- `.github/workflows/deploy.yml`: triggers are push to `main` and `workflow_dispatch`.
  - Job `gate` calls `ci.yml`. Deploy runs only if every gate passes.
  - Job `deploy` runs in environment `github-pages` (this is where the approval gate lives). Steps: `npm run generate`, `touch .output/public/.nojekyll`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.
  - The `.nojekyll` step is required. Pages runs Jekyll by default, which drops directories starting with `_`, and Nuxt's assets live in `_nuxt/`.
  - Concurrency group `pages` with `cancel-in-progress: false`, so a deploy is never cut off by the next one.
- `nuxt.config.ts` was NOT changed in this phase. `pages:extend`, `nitro.prerender.routes` and the head config are untouched.

### Pages compatibility of the 21 prerendered routes + 404

Checked against `.output/public`:
- `/` → `index.html`; `/en` → `en/index.html`; `/ru` → `ru/index.html`. Pages serves a directory URL without a trailing slash via a 301 to the slash form, then `index.html`. So `/ru` and `/ru/` both resolve.
- `/projects/<slug>` and the `/ru`, `/en` variants → `projects/<slug>/index.html` (same mechanism).
- Unknown paths → `404.html` with HTTP 404 (Pages serves it automatically).
- `_nuxt/`, `_payload.json` and `favicon.svg` are served as-is once `.nojekyll` exists.
- `200.html` is for SPA fallback only and is unused on Pages. Harmless.

## Release checklist

- [x] `npm run agents:check`
- [x] `npm run typecheck` (exit 0)
- [x] `npm run generate` (21 HTML routes + 404)
- [x] `npm run test:e2e` (85 passed)
- [x] QA: PASS (`06-test-report.md`)
- [x] PERF: PASS (`07-performance.md`)
- [x] Version bumped to 0.2.0
- [ ] Human approval (orchestrator gate)
- [ ] Native-speaker review of `app/data/site.ru.ts` and `app/data/site.en.ts` (both are drafts)
- [ ] Confirm `SITE_URL = https://3dot.uz` (`app/data/site.ts` still has a TODO for it)
- [ ] Repo settings below are done
- [ ] DNS for `3dot.uz` points to GitHub Pages
- [ ] Post-deploy smoke test below

## Changelog draft

### 0.2.0 — 2026-10-14

**Added**
- Russian (`/ru`) and English (`/en`) versions of every page. Uzbek (`/`) stays the default with no prefix.
- Language switcher in the header and mobile menu. The choice is stored in `localStorage` (`3dot:locale`) and redirects unprefixed URLs on the next visit.
- Light and dark themes with a toggle. The default follows the OS `prefers-color-scheme`. The choice is stored in `localStorage` (`3dot:theme`).
- Light-theme variant of the liquid-chrome WebGL scene (palette cross-fade, no shader recompile).
- Reduced-motion respected for the theme cross-fade.
- CI workflow (agents check, typecheck, generate, Playwright e2e) and a GitHub Pages deploy workflow gated on CI.

**Changed**
- Page `lang`, `<title>` and description are set per locale (`useSeoMeta`, `useLocaleHead`). Static head values were removed from `nuxt.config.ts`.
- Two media-scoped `theme-color` meta tags.
- Typography and layout adjusted for Russian text.

**Fixed**
- Typecheck errors in `app/composables/useSceneSections.ts` and `app/plugins/motion.client.ts`.

**Notes**
- ru and en copy is a draft and needs native-speaker review before the release is announced.

## Deploy steps (run by the user after approval)

Prerequisite: the repo settings below are done. Otherwise the deploy job fails at `deploy-pages`.

1. Check that only the intended files are changed:
   ```sh
   git status --short
   ```
   Expected: `app/`, `nuxt.config.ts`, `package.json`, `package-lock.json`, `.github/`, `docs/sdlc/2026-10-i18n-theme/`, `tests/e2e/i18n-theme.spec.ts`. Do not stage `3dot-update.tgz` or `example_3d.tgz`.
2. Put the change on a branch, so CI runs on a PR before `main` is touched:
   ```sh
   git switch -c feat/i18n-theme
   git add app nuxt.config.ts package.json package-lock.json .github docs/sdlc/2026-10-i18n-theme tests/e2e/i18n-theme.spec.ts
   git commit -m "feat: ru/en locales and light/dark theme" -m "Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
   git push -u origin feat/i18n-theme
   ```
3. Open a PR into `main`. Wait for the `CI / verify` check to go green.
4. Merge the PR. The push to `main` starts `Deploy`. Its `gate` job reruns the CI gates.
5. When the `deploy` job waits, approve it under the `github-pages` environment (Actions → the run → Review deployments).
6. After the deploy succeeds, run the smoke test below.

If you push straight to `main` instead, steps 1 and 2 become `git push origin HEAD:main`, step 3 is skipped, and the approval in step 5 is the only gate.

## Required repo settings (GitHub UI, one time)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Pages → Custom domain: `3dot.uz`.** Enable "Enforce HTTPS" once the certificate is issued.
3. **DNS for `3dot.uz`:** four A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. For `www`, a CNAME to `<owner>.github.io`.
4. **Settings → Environments → `github-pages` → Required reviewers:** add the approver(s). This is the human-approval gate. Without it, every push to `main` deploys immediately. Also restrict deployment branches to `main`.
5. Optional: **Settings → Branches → `main` protection:** require the `CI / verify` status check before merge.

No secrets or variables need to be added.

## Smoke test after deploy

```sh
for p in / /en /ru /en/projects/zavod-erp /ru/projects/zavod-erp /projects/zavod-erp /does-not-exist; do
  printf "%-32s " "$p"; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://3dot.uz$p"
done
```

Expected: `/` 200. `/en`, `/ru` and the project pages 200, or 301 to the slash form. `/does-not-exist` 404. Then open `https://3dot.uz/ru` in a browser and check the console for hydration warnings.

## Rollback

Deploys are whole-site snapshots, so rollback means deploying an older commit.

**Option A (preferred): revert on `main`.**
```sh
git switch main && git pull
git revert -m 1 <merge-commit-sha>    # for a squash merge, use: git revert <squash-commit-sha>
git push origin main                   # CI gate reruns, then Deploy waits for approval
```
This also reverts the version bump to 0.1.0.

**Option B: redeploy an older good build.** In Actions, open the last successful `Deploy` run and choose "Re-run all jobs". It rebuilds from that run's commit and still goes through the `github-pages` approval. Use it only when a revert is not possible.

Pages keeps no separate "previous site" to switch back to, so do not rely on the Pages UI for rollback.

## Open items

1. **`SITE_URL` is unconfirmed.** `app/data/site.ts` has `// TODO: confirm production origin`. Canonical, hreflang and og URLs all depend on it.
2. **Custom domain and CNAME file.** The custom domain is set in Pages settings and no `CNAME` file is committed (as instructed). If the domain disappears after the first Actions-based deploy, add a `CNAME` file containing `3dot.uz` to `public/`. That is a one-line change, but it is the user's call, so it is not made here.
3. **Trailing-slash redirect vs canonical.** Pages 301s `/ru` to `/ru/` and `/projects/x` to `/projects/x/`. The canonical URLs in `useLocale.ts` have no trailing slash, so each canonical URL redirects. That matters for SEO. The fix belongs to the app's URL/canonical policy (frontend-developer). Not changed here.
4. **ru/en copy** is a draft and needs native-speaker review.
5. **Performance follow-ups** from `07-performance.md` (not blocking): preload the ru/en copy chunk (finding 1), reduce en CLS (finding 2), self-host the fonts instead of loading Google Fonts (finding 3).
6. **Typecheck warning.** `npm run typecheck` exits 0 but prints `[Vue] Resolve plugin path failed: vue-router/volar/sfc-route-blocks ERR_PACKAGE_PATH_NOT_EXPORTED`. This looks like a `vue-router` / `vue-tsc` version mismatch, and route-block typing may be affected. Investigate after release.
7. **Duplicate e2e on `main`.** A push to `main` runs `CI` and the `Deploy` gate, so e2e runs twice. Kept for simplicity. Switch to `workflow_run` if run time matters.
8. **GitHub runner not yet exercised.** The workflows were validated as YAML only. The first real run may show issues with `playwright install --with-deps` or the Pages steps.
9. **Repo hygiene (outside this change):**
   - `3dot-update.tgz` and `example_3d.tgz` are empty tracked files.
   - A `dist` symlink in the repo root points to `.output/public`. It is gitignored.
   - An earlier shell command may have created `/tc.log` at the filesystem root, outside the repo. Delete it manually if it exists.
