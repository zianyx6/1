[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$localRoot=[Environment]::GetFolderPath('LocalApplicationData')
$installRoot=[IO.Path]::GetFullPath((Join-Path $localRoot 'Programs/QuotaCorner'))
$dataRoot=[IO.Path]::GetFullPath((Join-Path $localRoot 'QuotaCorner'))
if ($installRoot -ne [IO.Path]::GetFullPath((Join-Path $localRoot 'Programs\QuotaCorner')) -or $dataRoot -ne [IO.Path]::GetFullPath((Join-Path $localRoot 'QuotaCorner'))) { throw 'Unexpected uninstall paths' }
$statePath=Join-Path $dataRoot 'state.json'
$config=Get-Content -LiteralPath (Join-Path $installRoot 'machine.json') -Raw | ConvertFrom-Json
if (Test-Path -LiteralPath $statePath) {
  $state=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  $process=Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$state.pid)"
  if ($process -and $process.CommandLine -like "*$(Join-Path $installRoot 'main.mjs')*") {
    $children=@(Get-CimInstance Win32_Process -Filter "ParentProcessId=$([int]$state.pid)" | Where-Object { $_.CommandLine -match 'app-server' })
    Stop-Process -Id $process.ProcessId -ErrorAction SilentlyContinue
    foreach ($child in $children) { Stop-Process -Id $child.ProcessId -ErrorAction SilentlyContinue }
  }
  & $config.node (Join-Path $installRoot 'main.mjs') --remove --port $state.port --data $dataRoot
  if ($LASTEXITCODE -ne 0) { Write-Warning 'Client is closed or unreachable; injected UI disappears on normal exit.' }
}
$shortcut=Join-Path ([Environment]::GetFolderPath('Desktop')) 'QuotaCorner.lnk'
Remove-Item -LiteralPath $shortcut -Force -ErrorAction SilentlyContinue
foreach ($target in @($installRoot,$dataRoot)) { if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Recurse -Force } }
Write-Host 'QuotaCorner removed. ChatGPT was not stopped.'
