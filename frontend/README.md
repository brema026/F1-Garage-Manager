# F1 Garage Manager Frontend

React client for F1 Garage Manager.

## Local Setup

```powershell
Copy-Item .env.example .env
npm ci
npm start
```

The development server uses `http://localhost:3000` by default.

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Development server port | `3000` |
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:3001/api` |
| `REACT_APP_GRAFANA_URL` | Provisioned dashboard URL | `http://localhost:3003/d/f1-garage` |

Restart the development server after changing environment variables.

## Production Build

```powershell
npm run build
```

For the complete SQL Server, backend, and Grafana setup, follow the root [README](../README.md).
