$ErrorActionPreference = "Stop"
$tempDir = Join-Path $env:TEMP "Nexora-Build-$([guid]::NewGuid().ToString('N'))"
$dest = Join-Path $tempDir "Nexora-Law-Firm-main"
$tempZip = Join-Path $tempDir "Nexora-Law-Firm-main.zip"
$finalZip = Join-Path $PSScriptRoot "..\Nexora-Law-Firm-main.zip"

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $dest -Force | Out-Null

$exclude = @(
    'node_modules',
    '.next',
    '.git',
    '.env',
    'Nexora-Law-Firm-main',
    '*.zip',
    '.system_generated'
)

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Get-ChildItem -Path $root -Exclude $exclude | ForEach-Object {
    if ($_.Name -notin $exclude -and $_.Name -notlike "*.zip") {
        Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
    }
}

if (Test-Path $finalZip) {
    Remove-Item -Force $finalZip
}

Write-Host "Compressing archive to $tempZip..."
Compress-Archive -Path $dest -DestinationPath $tempZip -Force
Copy-Item -Path $tempZip -Destination $finalZip -Force
Remove-Item -Recurse -Force $tempDir

$zip = Get-Item $finalZip
Write-Host "SUCCESS: Created $($zip.FullName) ($([math]::Round($zip.Length / 1MB, 2)) MB)"
