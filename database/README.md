# Database Setup

The supported database installation is the ordered PowerShell installer:

```powershell
$env:F1_SETUP_APP_PASSWORD = 'choose-a-local-password'
./database/setup.ps1 -Server localhost -Database f1_garage_tec -AppUser f1_app_user -SeedDemo
```

It creates the database when needed, applies all schema objects in dependency order, optionally inserts fictional demo data, and can create a write-capable login for the backend.

The target database must be empty. The installer stops when tables already exist so it cannot silently overwrite an installation.

See the root [README](../README.md#database) for prerequisites, authentication options, the exact script order, backend configuration, and validation steps.

`tests/Inserts_Dummy.sql` is a historical manual fixture. It is not part of the supported setup path.
