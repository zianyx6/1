# Changelog

## Compatibility check — 2026-10-30

- Windows client 26.1027.3384.0: refreshed local executable paths, CLI mirror and shortcut icon; real subscription quota query succeeded.
- Seven JavaScript tests and Windows PowerShell runtime recovery tests passed.
- Live verification on 26.1027.3384.0 passed after reopening via QuotaCorner: toolbar placement, real quota/Token/cache metrics, automatic refresh, collapse/expand and light/dark/custom theme synchronization. Backend error log was empty.


## Unreleased

- Cache the desktop client's official icon as a standalone ICO in the installation directory, avoiding blank shortcut icons when Store version paths change.

## 0.1.1 — 2026-10-28

- Adapt desktop discovery for Windows client 26.1023.6123.0: prefer a running client, then the registered Store package, before an old configured path.
- Refresh the official CLI mirror from the newly selected client instead of retaining an older installed package.
- Validation: automatic tests and runtime-copy checks; full live UI verification on 26.1023.6123.0 is pending a normal restart through the QuotaCorner shortcut because the current client has no CDP endpoint.

- Restore a missing Store CLI mirror automatically when launching; refresh it from the current desktop version.
- Save launcher failures to launcher-error.log and show the actual error in the shortcut dialog.

- Follow the desktop client's semantic colors, fonts and shadows, including custom themes.
- Update immediately when the client changes theme; use the OS preference only as a fallback.
- Keep the floating panel outside toolbar clipping while inheriting body-level theme tokens.

## 0.1.0

- Blue and purple progress bars for five-hour and weekly Codex subscription quota.
- Session Token usage and cache hit rate.
- Collapsible dual-ring icon before the top toolbar's chat actions menu.
- Thirty-second quota refresh, separate local session scanning and stale-data indication.
- Local-only CDP attachment, per-user installation and uninstall scripts.
- MIT license and attribution for vendored usage collectors.
