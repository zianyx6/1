[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$dataRoot = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'QuotaCorner'
New-Item -ItemType Directory -Force -Path $dataRoot | Out-Null
$config = Get-Content -LiteralPath (Join-Path $root 'machine.json') -Raw | ConvertFrom-Json
if (-not (Test-Path -LiteralPath $config.node -PathType Leaf)) { throw 'Node.js path is unavailable. Run install.ps1 again.' }
$lockPath = Join-Path $dataRoot 'runtime.lock'
if (Test-Path -LiteralPath $lockPath) {
  try {
    $runtimeLock = Get-Content -LiteralPath $lockPath -Raw | ConvertFrom-Json
    $live = Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$runtimeLock.pid)"
    if ($live -and $live.CommandLine -like "*$(Join-Path $root 'main.mjs')*") { return }
  } catch {}
  Remove-Item -LiteralPath $lockPath -Force
}
$port = $null
foreach ($candidate in 9335..9345) {
  try {
    $targets = Invoke-RestMethod "http://127.0.0.1:$candidate/json/list" -TimeoutSec 1
    if (@($targets | Where-Object { $_.type -eq 'page' -and $_.url -like 'app://-/index.html*' }).Count) { $port = $candidate; break }
  } catch {}
}
if (-not $port) {
  if (Get-Process -Name ChatGPT -ErrorAction SilentlyContinue) { throw 'Please exit ChatGPT normally, then use the QuotaCorner shortcut. The running client has no local debugging endpoint.' }
  $desktopPath = $config.desktop
  if (-not (Test-Path -LiteralPath $desktopPath -PathType Leaf)) {
    $package = Get-AppxPackage -Name OpenAI.Codex | Select-Object -First 1
    if ($package) { $desktopPath = Join-Path $package.InstallLocation 'app/ChatGPT.exe' }
  }
  if (-not (Test-Path -LiteralPath $desktopPath -PathType Leaf)) { throw 'ChatGPT executable is unavailable. Run install.ps1 again.' }
  foreach ($candidate in 9335..9345) {
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$candidate)
    try { $listener.Start(); $port=$candidate; break } catch {} finally { $listener.Stop() }
  }
  if (-not $port) { throw 'No available local port.' }
  Start-Process -FilePath $desktopPath -ArgumentList @("--remote-debugging-port=$port",'--remote-debugging-address=127.0.0.1',"--remote-allow-origins=http://127.0.0.1:$port") | Out-Null
  $ready=$false
  for ($attempt=0;$attempt -lt 90;$attempt++) {
    try { $null=Invoke-RestMethod "http://127.0.0.1:$port/json/list" -TimeoutSec 1; $ready=$true; break } catch { Start-Sleep -Seconds 1 }
  }
  if (-not $ready) { throw 'ChatGPT local debugging endpoint did not become ready.' }
}
$cliPath = $config.cli
if (-not (Test-Path -LiteralPath $cliPath -PathType Leaf)) { throw 'Codex CLI is unavailable. Run install.ps1 again.' }
$arguments = @('"' + (Join-Path $root 'main.mjs') + '"','--port',"$port",'--cli','"'+$cliPath+'"','--data','"'+$dataRoot+'"')
Start-Process -FilePath $config.node -ArgumentList $arguments -WindowStyle Hidden -RedirectStandardOutput (Join-Path $dataRoot 'runtime.log') -RedirectStandardError (Join-Path $dataRoot 'error.log') | Out-Null
