# Guía de Conexión: Grafana + SQL Server 2022

**Proyecto:** F1 Garage Manager  
**Fecha:** 28 de enero de 2026

---

## 📋 Información del Sistema

```plaintext
Base de datos: f1_garage_tec
IP Local: 192.168.1.20
Puerto SQL Server: 1433
Grafana Container: f1-grafana
Grafana Port: 3004:3000
```

---

## ⚙️ Configuración de SQL Server

### 1. Habilitar TCP/IP

#### SQL Server Configuration Manager

1. Abre **SQL Server Configuration Manager**
   - `Win + R` → `SQLServerManager16.msc`

2. Navega a:
   ```
   SQL Server Network Configuration 
   → Protocols for MSSQLSERVER
   ```

3. Click derecho en **TCP/IP** → **Enable**

4. Click derecho en **TCP/IP** → **Properties**

5. Ve a la pestaña **IP Addresses**

6. Desplázate hasta la sección **IPALL** (al final)

7. Configura:
   ```
   TCP Dynamic Ports: [vacío, borrarlo si tiene algo]
   TCP Port: 1433
   ```

8. Click **OK**

---

### 2. Reiniciar SQL Server

#### PowerShell (como Administrador):

```powershell
Restart-Service MSSQLSERVER
```

**O manualmente:**
- `Win + R` → `services.msc`
- Busca **SQL Server (MSSQLSERVER)**
- Click derecho → **Restart**

---

### 3. Configurar Firewall de Windows

#### PowerShell (como Administrador):

```powershell
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
```

---

### 4. Verificar que SQL Server Está Escuchando

#### PowerShell:

```powershell
netstat -an | findstr 1433
```

**Salida esperada:**

```plaintext
TCP    0.0.0.0:1433           0.0.0.0:0              LISTENING
TCP    [::]:1433              [::]:0                 LISTENING
```

✅ Si ves `LISTENING`, SQL Server está listo.

---

### 5. Obtener IP Local

#### PowerShell:

```powershell
ipconfig
```

**Busca en la salida:**

```plaintext
Adaptador de Ethernet Ethernet:
   Dirección IPv4. . . . . . . . . . . . . . : 192.168.1.20
```

Esa es tu IP local que usarás en Grafana.

---

## 🐳 Configuración de Grafana (Docker)

### 1. Archivo docker-compose.grafana.yml

```yaml
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    container_name: f1-grafana
    ports:
      - "3004:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_SECURITY_ADMIN_USER=admin
      - GF_INSTALL_PLUGINS=grafana-clock-panel
      - GF_FEATURE_TOGGLES_ENABLE=publicDashboards
    volumes:
      - ./grafana-data:/var/lib/grafana
    restart: unless-stopped
    networks:
      - f1-network
    extra_hosts:
      - "host.docker.internal:host-gateway"

networks:
  f1-network:
    driver: bridge
```

**Nota importante:** 
- `extra_hosts` permite que Grafana se conecte a SQL Server en el host
- Puerto `3004:3000` expone Grafana en el puerto 3004

---

### 2. Iniciar Grafana

#### PowerShell (en la carpeta del proyecto):

```powershell
docker-compose -f docker-compose.grafana.yml up -d
```

---

### 3. Verificar Contenedor

#### PowerShell:

```powershell
docker ps
```

**Salida esperada:**

```plaintext
CONTAINER ID   IMAGE                    STATUS         PORTS                    NAMES
abc123def456   grafana/grafana:latest   Up 2 minutes   0.0.0.0:3004->3000/tcp   f1-grafana
```

---

### 4. Ver Logs (si necesitas troubleshooting)

#### PowerShell:

```powershell
docker logs f1-grafana -f
```

Presiona `Ctrl + C` para salir.

---

## 🔌 Configuración del Data Source en Grafana

### 1. Acceder a Grafana

1. Abre tu navegador
2. Ve a: `http://localhost:3004`
3. Login:
   - **Usuario:** `admin`
   - **Password:** `admin`

---

### 2. Agregar Data Source

1. Click en **⚙️ Configuration** → **Data sources**
2. Click en **Add data source**
3. Selecciona **Microsoft SQL Server**

---

### 3. Configurar Conexión

#### Connection Settings:

```plaintext
Name: F1_Garage_DB
☑ Default

Host: 192.168.1.20:1433
Database: f1_garage_tec
```

#### TLS/SSL Auth:

```plaintext
Encrypt: disable
```

#### Authentication:

```plaintext
Authentication Type: SQL Server Authentication
Username: f1_app_user
Password: F1Garage!2025
```

#### Additional Settings (despliega):

```plaintext
Max open: 100
Max idle: 100
Max lifetime: 14400
```

---

### 4. Guardar y Probar

1. Baja hasta el final
2. Click en **Save & test**

**Resultado esperado:**

```plaintext
✅ Database Connection OK
```

---

## ✅ Verificación de Conexión

### 1. Probar en Explore

1. Click en **🧭 Explore**
2. Selecciona **F1_Garage_DB**
3. Cambia a modo **Code**
4. Pega:

```sql
SELECT 
    id_equipo as "ID",
    nombre as "Nombre"
FROM dbo.equipo
WHERE id_equipo > 0
ORDER BY nombre
```

5. Click en **Run query**

Si ves datos, ¡la conexión funciona! 🎉

---

### 2. Query Simple de Verificación

```sql
SELECT GETDATE() as current_time
```

Si este funciona, la conexión está OK.

---

## 🔧 Troubleshooting Común

### Problema: "Cannot connect to host"

**Solución:** Usa tu IP local en lugar de `host.docker.internal`:

```plaintext
Host: 192.168.1.20:1433
```

---

### Problema: Timeout de Conexión

**Verificar que SQL Server está escuchando:**

```powershell
netstat -an | findstr 1433
```

**Verificar firewall:**

```powershell
Get-NetFirewallRule -DisplayName "SQL Server"
```

**Verificar TCP/IP habilitado:**
- SQL Server Configuration Manager
- Protocols for MSSQLSERVER
- TCP/IP debe estar **Enabled**

---

### Problema: Grafana no inicia

**Ver logs:**

```powershell
docker logs f1-grafana
```

**Reiniciar contenedor:**

```powershell
docker restart f1-grafana
```

**Detener y volver a iniciar:**

```powershell
docker-compose -f docker-compose.grafana.yml down
docker-compose -f docker-compose.grafana.yml up -d
```

---

## 📝 Comandos Útiles

### PowerShell

```powershell
# Obtener IP local
ipconfig

# Verificar puerto SQL Server
netstat -an | findstr 1433

# Verificar contenedor Grafana
docker ps

# Ver logs de Grafana
docker logs f1-grafana -f

# Reiniciar SQL Server
Restart-Service MSSQLSERVER

# Reiniciar Grafana
docker restart f1-grafana

# Detener Grafana
docker-compose -f docker-compose.grafana.yml down

# Iniciar Grafana
docker-compose -f docker-compose.grafana.yml up -d

# Ver regla de firewall
Get-NetFirewallRule -DisplayName "SQL Server"
```

---

## ✨ Checklist de Configuración

- [ ] SQL Server TCP/IP habilitado (puerto 1433)
- [ ] SQL Server reiniciado después de cambios
- [ ] Firewall permite puerto 1433
- [ ] IP local identificada con `ipconfig`
- [ ] Grafana container corriendo (puerto 3004)
- [ ] Data source `F1_Garage_DB` configurado
- [ ] Conexión probada (Database Connection OK)
- [ ] Query de prueba ejecutado exitosamente

---

## 📊 Resumen de Configuración

```yaml
Red:
  IP Local: 192.168.1.20
  Puerto SQL: 1433
  Puerto Grafana: 3004

Base de Datos:
  Nombre: f1_garage_tec
  Usuario: f1_app_user
  Password: F1Garage!2025

Grafana Data Source:
  Nombre: F1_Garage_DB
  Host: 192.168.1.20:1433
  Encrypt: disable
  Auth: SQL Server Authentication
```

---

**Estado:** ✅ Conexión establecida y funcional