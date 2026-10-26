$ErrorActionPreference='Stop'
. (Join-Path (Split-Path -Parent $PSScriptRoot) 'runtime-utils.ps1')
$tempParent=[IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot=[IO.Path]::GetFullPath((Join-Path $tempParent ('QuotaCorner-test-'+[Guid]::NewGuid().ToString('N'))))
if(-not $testRoot.StartsWith($tempParent,[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe test path'}
try{
  $desktop=Join-Path $testRoot 'WindowsApps/package/app/ChatGPT.exe'
  $source=Join-Path (Split-Path -Parent $desktop) 'resources/codex.exe'
  $data=Join-Path $testRoot 'data'
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $source) | Out-Null
  [IO.File]::WriteAllText($source,'fixture-1')
  $missing=Join-Path $data 'runtime/codex.exe'
  $resolved=Resolve-QuotaCornerRuntimeCli -ConfiguredCli $missing -DesktopPath $desktop -DataRoot $data
  if($resolved -ne $missing -or [IO.File]::ReadAllText($resolved) -ne 'fixture-1'){throw 'Missing CLI copy was not recovered'}
  Remove-Item -LiteralPath $resolved -Force
  $resolved=Resolve-QuotaCornerRuntimeCli -ConfiguredCli $missing -DesktopPath $desktop -DataRoot $data
  if(-not(Test-Path -LiteralPath $resolved)){throw 'Deleted CLI copy was not recovered'}
  [IO.File]::WriteAllText($source,'fixture-2-updated')
  $resolved=Resolve-QuotaCornerRuntimeCli -ConfiguredCli $missing -DesktopPath $desktop -DataRoot $data
  if([IO.File]::ReadAllText($resolved) -ne 'fixture-2-updated'){throw 'Updated client CLI was not copied'}
  $external=Join-Path $testRoot 'custom-cli.exe';[IO.File]::WriteAllText($external,'external')
  if((Resolve-QuotaCornerRuntimeCli -ConfiguredCli $external -DesktopPath $desktop -DataRoot $data) -ne $external){throw 'Explicit external CLI was not preserved'}
  if(@(Get-ChildItem -LiteralPath (Join-Path $data 'runtime') -Filter '*.tmp').Count){throw 'Temporary copy file leaked'}
  Write-Host 'PASS: missing/deleted/updated Store CLI recovery, explicit CLI preference and temporary-file cleanup.'
}finally{
  if($testRoot.StartsWith($tempParent,[StringComparison]::OrdinalIgnoreCase) -and (Split-Path -Leaf $testRoot) -like 'QuotaCorner-test-*' -and (Test-Path -LiteralPath $testRoot)){Remove-Item -LiteralPath $testRoot -Recurse -Force}
}
