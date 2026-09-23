# Grafana and SQL Server

Grafana is configured through [Docker Compose](docker-compose.grafana.yml). The MSSQL datasource and F1 Garage dashboard are provisioned automatically; no manual dashboard import is required.

## Configuration

From the repository root:

```powershell
Copy-Item grafana/.env.example grafana/.env
```

Edit `grafana/.env` with:

- local Grafana administrator credentials;
- the SQL Server host and database;
- a dedicated SQL login with read-only access.

Create the SQL account with a local password:

```sql
USE [master];
CREATE LOGIN [f1_grafana_reader] WITH PASSWORD = 'choose-a-local-password', CHECK_POLICY = ON;
USE [f1_garage_tec];
CREATE USER [f1_grafana_reader] FOR LOGIN [f1_grafana_reader];
ALTER ROLE [db_datareader] ADD MEMBER [f1_grafana_reader];
```

Start Grafana:

```powershell
docker compose --env-file grafana/.env -f grafana/docker-compose.grafana.yml up -d
```

Open `http://localhost:3003`. The container listens only on the local computer.

On Docker Desktop, the default `host.docker.internal:1433` reaches SQL Server on the host. If SQL Server runs elsewhere, change `GRAFANA_DB_HOST` and allow only that required connection.

For the complete setup, environment variables, troubleshooting context, and validation status, see the root [README](../README.md#grafana--monitoring).
