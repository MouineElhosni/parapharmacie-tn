param(
    [string]$Uri = "",
    [string]$BackupFile = ""
)

$mysql = "C:\xampp\mysql\bin\mysql.exe"

if (-not (Test-Path $mysql)) {
    $mysql = "mysql"
}

if (-not $BackupFile) {
    $BackupFile = (Get-ChildItem "$PSScriptRoot\*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
}

if (-not (Test-Path $BackupFile)) {
    Write-Error "Aucun fichier de sauvegarde trouve dans $PSScriptRoot"
    exit 1
}

Write-Host "Backup: $BackupFile"

if ($Uri) {
    $parts = [System.Uri]$Uri
    $hostname = $parts.Host
    $port = if ($parts.Port -eq -1) { 3306 } else { $parts.Port }
    $db = $parts.AbsolutePath.TrimStart("/")
    $userInfo = $parts.UserInfo
    if (-not $userInfo) { Write-Error "Le URI doit contenir user:pass@"; exit 1 }
    $user = $userInfo.Split(":")[0]
    $pass = $userInfo.Substring($user.Length + 1)

    Write-Host "Restaurer vers $hostname`:$port / $db ..."
    $env:MYSQL_PWD = $pass
    try {
        Get-Content -Raw $BackupFile | & $mysql -h $hostname -P $port -u $user --ssl $db
        if ($LASTEXITCODE -ne 0) { Write-Error "Echec du restore (essayez sans --ssl)"; exit 1 }
        Write-Host "Restore OK."
    } finally {
        Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "Restaurer vers le MySQL local (localhost / ecommerce) ..."
    Get-Content -Raw $BackupFile | & $mysql -u root --skip-password ecommerce
    if ($LASTEXITCODE -ne 0) { Write-Error "Echec du restore"; exit 1 }
    Write-Host "Restore OK."
}
