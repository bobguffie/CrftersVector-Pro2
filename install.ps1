$repo = "bobguffie/crafters-vector-pro"
$releases = "https://api.github.com/repos/$repo/releases/latest"
$asset = (Invoke-RestMethod -Uri $releases).assets | Where-Object { $_.name -like "*.exe" } | Select-Object -First 1

if ($asset) {
    $url = $asset.browser_download_url
    $dest = "$env:TEMP\CraftersVectorProSetup.exe"
    Write-Host "Downloading Crafters Vector Pro from $url..."
    Invoke-WebRequest -Uri $url -OutFile $dest
    Write-Host "Installing..."
    Start-Process -FilePath $dest -ArgumentList "/S" -Wait
    Write-Host "Installation complete!"
} else {
    Write-Error "No Windows installer found in the latest release."
}
