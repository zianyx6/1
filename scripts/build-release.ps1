[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$version=(Get-Content -LiteralPath (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
if ($version -notmatch '^\d+\.\d+\.\d+$') { throw 'Invalid version' }
$dist=[IO.Path]::GetFullPath((Join-Path $root 'dist'))
$stage=[IO.Path]::GetFullPath((Join-Path $dist "QuotaCorner-$version"))
if (-not $stage.StartsWith($dist+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe staging path' }
if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null
$files=@('cdp.mjs','main.mjs','widget.js','launch.ps1','launch.vbs','install.ps1','uninstall.ps1','README.md','NOTICE.md','LICENSE','SECURITY.md','CHANGELOG.md','package.json','package-lock.json')
foreach ($file in $files) { Copy-Item -LiteralPath (Join-Path $root $file) -Destination (Join-Path $stage $file) }
foreach ($folder in @('vendor','docs','tests','scripts')) { Copy-Item -LiteralPath (Join-Path $root $folder) -Destination $stage -Recurse }
$zip=Join-Path $dist "QuotaCorner-$version.zip"
if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }
Compress-Archive -LiteralPath $stage -DestinationPath $zip -CompressionLevel Optimal
Get-FileHash -LiteralPath $zip -Algorithm SHA256
