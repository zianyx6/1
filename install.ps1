[CmdletBinding()]
param([string]$DesktopPath,[string]$CliPath)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'runtime-utils.ps1')
$installRoot=Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Programs/QuotaCorner'
$dataRoot=Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'QuotaCorner'
$nodeCandidates=@((Get-Command node.exe -ErrorAction SilentlyContinue).Source,(Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'),(Join-Path $env:ProgramFiles 'nodejs/node.exe'))
$node=$nodeCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Leaf) } | Select-Object -First 1
if (-not $node -or [int](& $node -p 'process.versions.node.split(".")[0]') -lt 22) { throw 'Node.js 22+ required.' }
if (-not $DesktopPath) { $DesktopPath=Get-Process -Name ChatGPT -ErrorAction SilentlyContinue | Where-Object Path | Select-Object -First 1 -ExpandProperty Path }
if (-not $DesktopPath) { $pkg=Get-AppxPackage -Name OpenAI.Codex | Select-Object -First 1; if ($pkg) { $DesktopPath=Join-Path $pkg.InstallLocation 'app/ChatGPT.exe' } }
if (-not $DesktopPath -or -not (Test-Path -LiteralPath $DesktopPath -PathType Leaf)) { throw 'Provide the real ChatGPT executable with -DesktopPath.' }
if (-not $CliPath) {
  $cliCandidates=@((Join-Path (Split-Path -Parent $DesktopPath) 'resources/codex.exe'),(Join-Path (Split-Path -Parent $DesktopPath) 'codex.exe'))
  $CliPath=$cliCandidates | Where-Object {Test-Path -LiteralPath $_ -PathType Leaf} | Select-Object -First 1
}
if (-not $CliPath -or -not (Test-Path -LiteralPath $CliPath -PathType Leaf)) { throw 'Provide the real Codex CLI executable with -CliPath.' }
New-Item -ItemType Directory -Force -Path $installRoot,$dataRoot | Out-Null
$CliPath=Resolve-QuotaCornerRuntimeCli -ConfiguredCli $CliPath -DesktopPath $DesktopPath -DataRoot $dataRoot
$files=@('cdp.mjs','main.mjs','widget.js','runtime-utils.ps1','launch.ps1','launch.vbs','install.ps1','uninstall.ps1','README.md','NOTICE.md','LICENSE','SECURITY.md')
foreach ($relative in $files) { Copy-Item -LiteralPath (Join-Path $PSScriptRoot $relative) -Destination (Join-Path $installRoot $relative) -Force }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'vendor') -Destination $installRoot -Recurse -Force
@{node=$node;desktop=$DesktopPath;cli=$CliPath} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $installRoot 'machine.json') -Encoding UTF8
$shortcutPath=Join-Path ([Environment]::GetFolderPath('Desktop')) 'QuotaCorner.lnk'
$shortcut=(New-Object -ComObject WScript.Shell).CreateShortcut($shortcutPath)
$shortcut.TargetPath=Join-Path $env:SystemRoot 'System32/wscript.exe'
$shortcut.Arguments='"'+(Join-Path $installRoot 'launch.vbs')+'"'
$shortcut.WorkingDirectory=$installRoot
$shortcut.Description='ChatGPT quota progress bars'
$stableIcon=New-QuotaCornerIcon -DesktopPath $DesktopPath -Destination (Join-Path $installRoot 'QuotaCorner.ico')
$shortcut.IconLocation=$(if($stableIcon){$stableIcon+',0'}else{$DesktopPath+',0'})
$shortcut.Save()
Write-Host "Installed: $installRoot"
Write-Host "Shortcut: $shortcutPath"
