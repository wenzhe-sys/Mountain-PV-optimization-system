# Push to GitHub - PowerShell Script
# 请在 PowerShell 中执行此脚本

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Mountain PV Optimization - GitHub Upload" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# 项目目录
$projectPath = "C:\Users\er\OneDrive\桌面\pv-optimization-backup\pv-optimization"

# 进入项目目录
Set-Location $projectPath
Write-Host "`nWorking in: $PWD" -ForegroundColor Yellow

# 尝试提交
Write-Host "`nStep 1: Checking Git status..." -ForegroundColor Cyan
git status

# 添加所有文件
Write-Host "`nStep 2: Adding files..." -ForegroundColor Cyan
git add -A

# 提交
Write-Host "`nStep 3: Committing..." -ForegroundColor Cyan
git commit -m "Initial commit: Complete mountain PV optimization system with deployment files"

# 设置远程仓库
Write-Host "`nStep 4: Setting remote origin..." -ForegroundColor Cyan
git remote add origin git@github.com:wenzhe-sys/Mountain-PV-optimization-system.git 2>$null
git remote set-url origin git@github.com:wenzhe-sys/Mountain-PV-optimization-system.git

# 推送到 main 分支
Write-Host "`nStep 5: Pushing to GitHub..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "Done! Check your GitHub repository:" -ForegroundColor Green
Write-Host "https://github.com/wenzhe-sys/Mountain-PV-optimization-system" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Green