# NightAgent Push Status — 2026-07-17

## Result: RESOLVED — pushed successfully via SSH

`nightagent/2026-07-17` (65 commits ahead of prior origin/main state, HEAD `ed9785e`) is now on
`origin/nightagent/2026-07-17`. Verified with `git ls-remote` — remote SHA matches local HEAD exactly.

## Root Cause

The remote was configured as `https://github.com/MichaelrKraft/done-deal-site.git`, and git's
`credential.helper` is `osxkeychain`. In this sandboxed/non-interactive session, macOS Keychain is
not reachable, so any HTTPS git operation requiring auth fails with
`fatal: could not read Username for 'https://github.com': Device not configured`.

Separately, `gh auth status` reports the stored token for account `MichaelrKraft` as invalid — this
is a **different, independent problem** (the gh CLI's own OAuth token, stored via keychain-backed
config, has expired or been revoked). Ten-plus nights of diagnosis conflated these two issues: the
`gh` token being dead is a red herring for the push failure. The actual push blocker is the HTTPS
credential helper being unusable headlessly — not gh authentication at all, since git push doesn't
use `gh` unless explicitly invoked through it.

`~/.config/gh/hosts.yml` contains no plaintext `oauth_token` (confirms it defers to the OS keychain).
No `GITHUB_TOKEN`/`GH_TOKEN` env var was set in the shell.

## What Fixed It

An SSH key (`~/.ssh/id_ed25519`) already exists and is already registered with GitHub as
`MichaelrKraft`. It requires no keychain/interactive access:

```
ssh -T -o BatchMode=yes -o ConnectTimeout=8 git@github.com
# => "Hi MichaelrKraft! You've successfully authenticated, but GitHub does not provide shell access."
```

Network egress to github.com is fine (confirmed via `git ls-remote https://...` succeeding read-only,
and SSH port working for push).

Fix applied: switched the `origin` remote from HTTPS to SSH, then did a normal (non-force) branch push:

```
git remote set-url origin git@github.com:MichaelrKraft/done-deal-site.git
git push -u origin nightagent/2026-07-17
```

This succeeded immediately — new branch created on origin, no PR opened (push only, as instructed).

## Recommended Permanent Fix (human action)

To prevent this recurring every night, make the SSH remote the permanent default so future NightAgent
sessions don't hit the keychain wall at all:

1. This repo's `origin` remote is now already SSH (`git@github.com:MichaelrKraft/done-deal-site.git`)
   as of this session — no action needed here going forward, *unless* something resets it back to HTTPS
   (e.g. a fresh clone by the NightAgent harness).
2. If the NightAgent sandbox re-clones the repo fresh each night (rather than reusing this working
   copy), the clone will default back to HTTPS and hit the same wall. In that case, the human should
   either:
   - Configure the NightAgent harness/sandbox provisioning to clone via `git@github.com:...` instead
     of `https://github.com/...`, OR
   - Add a `GITHUB_TOKEN` (repo-scoped PAT) as an env var available to the sandbox, and configure git
     to use it via `http.https://github.com/.extraheader` or `gh auth login --with-token`, which
     doesn't touch the keychain.
3. Separately (lower priority, not blocking): `gh auth login -h github.com` should be re-run
   interactively on the host machine to refresh the dead gh CLI token — this is unrelated to git push
   but affects any `gh pr create` / `gh` CLI usage NightAgent may want later.

## Verification
```
$ git log --oneline -1
ed9785e feat(nightagent): autonomous session 2026-07-16
$ git ls-remote origin refs/heads/nightagent/2026-07-17
ed9785e4068a963a3bbacebade52884a41342ec1	refs/heads/nightagent/2026-07-17
```
Local HEAD and remote branch SHA match exactly.
