# Third-party code

The files in vendor/ are copied unchanged from JiaYang-BUAA/Codex-Desktop-Usage-Monitor-Windows v3.2.1 (MIT). The full license is in vendor/LICENSE.

Source: https://github.com/JiaYang-BUAA/Codex-Desktop-Usage-Monitor-Windows/tree/v3.2.1

QuotaCorner uses only UsageClient, LocalCodexTokenTracker and current-thread selection. It does not instantiate API-account clients, forecast clients, an updater, or auto-resume functionality. Its interface, local CDP transport, launcher and daemon are separate implementations.
