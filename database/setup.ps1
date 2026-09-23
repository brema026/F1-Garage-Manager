param(
    [string]$Server = 'localhost',
    [string]$Database = 'f1_garage_tec',
    [string]$User,
    [string]$Password,
    [string]$AppUser,
    [switch]$SeedDemo
)

$ErrorActionPreference = 'Stop'

if ($Database -notmatch '^[A-Za-z][A-Za-z0-9_]{0,127}$') {
    throw 'Database must start with a letter and contain only letters, numbers, and underscores.'
}

if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    throw 'sqlcmd was not found. Install Microsoft SQL Server command-line tools first.'
}

$connectionArgs = @('-S', $Server, '-C', '-b', '-V', '16', '-I')
if ($User) {
    if (-not $Password) { throw 'Password is required when User is provided.' }
    $connectionArgs += @('-U', $User, '-P', $Password)
} else {
    $connectionArgs += '-E'
}

$escapedDatabase = $Database.Replace(']', ']]')
$createSql = "IF DB_ID(N'$Database') IS NULL CREATE DATABASE [$escapedDatabase];"
& sqlcmd @connectionArgs -d master -Q $createSql
if ($LASTEXITCODE -ne 0) { throw 'Could not create or access the database.' }

$scripts = @(
    'schemas/schema.sql',
    'procedures/users.sql',
    'procedures/teams.sql',
    'procedures/sponsors.sql',
    'procedures/parts-inventory.sql',
    'procedures/cars.sql',
    'procedures/circuits.sql',
    'procedures/simulation.sql',
    'triggers/trg_crear_conductor.sql',
    'views/vw_presupuesto_equipo.sql',
    'views/grafana_views.sql'
)

if ($SeedDemo) { $scripts += 'seeds/demo.sql' }

Push-Location $PSScriptRoot
try {
    foreach ($script in $scripts) {
        Write-Host "Applying $script"
        & sqlcmd @connectionArgs -d $Database -v "DatabaseName=$Database" -i $script
        if ($LASTEXITCODE -ne 0) { throw "Database setup failed in $script" }
    }
} finally {
    Pop-Location
}

if ($AppUser) {
    if ($AppUser -notmatch '^[A-Za-z][A-Za-z0-9_]{0,127}$') {
        throw 'AppUser must start with a letter and contain only letters, numbers, and underscores.'
    }
    $appPassword = $env:F1_SETUP_APP_PASSWORD
    if (-not $appPassword -or $appPassword.Length -lt 12 -or $appPassword -match '^YOUR_') {
        throw 'Set F1_SETUP_APP_PASSWORD to a non-placeholder value of at least 12 characters.'
    }
    $escapedUser = $AppUser.Replace(']', ']]')
    $userLiteral = $AppUser.Replace("'", "''")
    $passwordLiteral = $appPassword.Replace("'", "''")
    $loginSql = @"
IF SUSER_ID(N'$userLiteral') IS NULL
    CREATE LOGIN [$escapedUser] WITH PASSWORD=N'$passwordLiteral', CHECK_POLICY=ON;
USE [$escapedDatabase];
IF USER_ID(N'$userLiteral') IS NULL CREATE USER [$escapedUser] FOR LOGIN [$escapedUser];
ALTER ROLE db_datareader ADD MEMBER [$escapedUser];
ALTER ROLE db_datawriter ADD MEMBER [$escapedUser];
GRANT EXECUTE TO [$escapedUser];
"@
    & sqlcmd @connectionArgs -d master -Q $loginSql
    if ($LASTEXITCODE -ne 0) { throw 'Could not configure the application login.' }
    Remove-Item Env:F1_SETUP_APP_PASSWORD -ErrorAction SilentlyContinue
    Write-Host "Application login '$AppUser' is ready."
}

Write-Host "Database '$Database' is ready."
