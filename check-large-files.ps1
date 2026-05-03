# Check for large files before GitHub push
Write-Host "Checking for files larger than 50MB..." -ForegroundColor Yellow

$largeFiles = Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 50MB }

if ($largeFiles) {
    Write-Host "`nFound large files (will be excluded by .gitignore):" -ForegroundColor Red
    $largeFiles | ForEach-Object {
        Write-Host "$([math]::Round($_.Length/1MB,2)) MB - $($_.FullName)" -ForegroundColor Red
    }
} else {
    Write-Host "No files larger than 50MB found in working directory." -ForegroundColor Green
}

# Check what Git will actually commit
Write-Host "`nGit staged files:" -ForegroundColor Cyan
git status --short