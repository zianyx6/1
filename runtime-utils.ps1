function Resolve-QuotaCornerDesktop {
  param([string]$ConfiguredPath)
  $candidates=@()
  $candidates+=@(Get-Process -Name ChatGPT -ErrorAction SilentlyContinue | Where-Object Path | Select-Object -ExpandProperty Path -Unique)
  foreach($candidate in $candidates){if($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)){return $candidate}}
  try{$package=Get-AppxPackage -Name OpenAI.Codex -ErrorAction Stop | Select-Object -First 1;if($package){$candidate=Join-Path $package.InstallLocation 'app/ChatGPT.exe';if(Test-Path -LiteralPath $candidate -PathType Leaf){return $candidate}}}catch{}
  if($ConfiguredPath -and (Test-Path -LiteralPath $ConfiguredPath -PathType Leaf)){return $ConfiguredPath}
  throw 'ChatGPT executable is unavailable. Run install.ps1 with the real -DesktopPath.'
}

function Resolve-QuotaCornerRuntimeCli {
  param([string]$ConfiguredCli,[string]$DesktopPath,[string]$DataRoot)
  $mirrorRoot=Join-Path $DataRoot 'runtime'
  $mirror=Join-Path $mirrorRoot 'codex.exe'
  $configuredExists=$ConfiguredCli -and (Test-Path -LiteralPath $ConfiguredCli -PathType Leaf)
  if($configuredExists -and $ConfiguredCli -notmatch '[\\/]WindowsApps[\\/]' -and -not [IO.Path]::GetFullPath($ConfiguredCli).StartsWith([IO.Path]::GetFullPath($mirrorRoot)+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){return $ConfiguredCli}
  $desktopDirectory=Split-Path -Parent $DesktopPath
  $sources=@((Join-Path $desktopDirectory 'resources/codex.exe'),(Join-Path $desktopDirectory 'codex.exe'),$ConfiguredCli)
  $source=$sources | Where-Object{$_ -and (Test-Path -LiteralPath $_ -PathType Leaf)} | Select-Object -First 1
  if(-not $source){throw 'Codex CLI is unavailable in the current client. Run install.ps1 with the real -CliPath.'}
  if($source -notmatch '[\\/]WindowsApps[\\/]'){return $source}
  New-Item -ItemType Directory -Force -Path $mirrorRoot | Out-Null
  $sourceInfo=Get-Item -LiteralPath $source
  $copyInfo=Get-Item -LiteralPath $mirror -ErrorAction SilentlyContinue
  if($copyInfo -and ($copyInfo.Length -ne $sourceInfo.Length -or $copyInfo.LastWriteTimeUtc -ne $sourceInfo.LastWriteTimeUtc)){
    # Never replace an older CLI that may still be in use during a desktop update.
    $mirror=Join-Path $mirrorRoot ("codex-"+$sourceInfo.Length+'-'+$sourceInfo.LastWriteTimeUtc.Ticks+'.exe')
    $copyInfo=Get-Item -LiteralPath $mirror -ErrorAction SilentlyContinue
  }
  if(-not $copyInfo -or $copyInfo.Length -ne $sourceInfo.Length -or $copyInfo.LastWriteTimeUtc -ne $sourceInfo.LastWriteTimeUtc){
    # Copy file bytes rather than Store/EFS metadata. Copy-Item can fail with
    # "The specified file could not be encrypted" for WindowsApps executables.
    $temporary=Join-Path $mirrorRoot "codex.$PID.tmp"
    $inputStream=$null;$outputStream=$null
    try{
      try{
        $inputStream=[IO.File]::Open($source,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
        $outputStream=[IO.File]::Open($temporary,[IO.FileMode]::Create,[IO.FileAccess]::Write,[IO.FileShare]::None)
        $inputStream.CopyTo($outputStream,1MB)
        $outputStream.Flush()
      }finally{if($outputStream){$outputStream.Dispose()};if($inputStream){$inputStream.Dispose()}}
      if((Get-Item -LiteralPath $temporary).Length -ne $sourceInfo.Length){throw 'The local Codex CLI copy is incomplete.'}
      Move-Item -LiteralPath $temporary -Destination $mirror -Force
      [IO.File]::SetLastWriteTimeUtc($mirror,$sourceInfo.LastWriteTimeUtc)
    }finally{Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue}
  }
  if((Get-Item -LiteralPath $mirror).Length -ne $sourceInfo.Length){throw 'The local Codex CLI copy is incomplete.'}
  return $mirror
}
