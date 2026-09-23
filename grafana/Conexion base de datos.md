# Guía de Conexión: Grafana + SQL Server 2022

**Proyecto:** F1 Garage Manager  
**Fecha:** 28 de enero de 2026

---

## 📋 Información del Sistema

```plaintext
Base de datos: f1_garage_tec
IP Local: 192.168.1.20
Puerto SQL Server: 1433
Grafana Container: f1_garage_grafana
Grafana Port: 3003:3000
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

Solo si la conexión lo requiere, sustituye `<TRUSTED_CLIENT_IP>` por el origen autorizado. No abras SQL Server a toda la red.

#### PowerShell (como Administrador):

```powershell
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -RemoteAddress <TRUSTED_CLIENT_IP> -Action Allow
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

Usa el [Compose versionado](docker-compose.grafana.yml) y copia [.env.example](.env.example) a `.env` dentro de esta carpeta. Completa las credenciales locales antes de iniciar Grafana.

La contraseña de administrador y la del datasource provienen de variables de entorno. Para SQL usa una cuenta independiente de solo lectura. Mantén `.env` fuera de Git; usa comillas simples si una contraseña contiene `$`.

El volumen de provisioning se monta en modo de solo lectura. Grafana queda accesible únicamente desde `127.0.0.1:3003`, sin acceso anónimo ni registro público.

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
abc123def456   grafana/grafana:latest   Up 2 minutes   0.0.0.0:3003->3000/tcp   f1_garage_grafana
```

---

### 4. Ver Logs (si necesitas troubleshooting)

#### PowerShell:

```powershell
docker logs f1_garage_grafana -f
```

Presiona `Ctrl + C` para salir.

---

## 🔌 Configuración del Data Source en Grafana

### 1. Acceder a Grafana

1. Abre tu navegador
2. Ve a: `http://localhost:3003`
3. Login:
   - **Usuario:** valor local de `GRAFANA_ADMIN_USER`
   - **Password:** valor local de `GRAFANA_ADMIN_PASSWORD`

---

### 2. Agregar Data Source

Con el Compose versionado, el datasource se aprovisiona automáticamente y se cambia mediante las variables de entorno. Los pasos manuales siguientes son una referencia para una instalación que no use provisioning.

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

Usa un certificado confiable y un hostname que coincida con él. El cifrado está habilitado; no desactives la verificación TLS para una instalación compartida.

```plaintext
Encrypt: true
```

#### Authentication:

```plaintext
Authentication Type: SQL Server Authentication
Username: YOUR_READ_ONLY_DB_USER
Password: YOUR_LOCAL_DB_PASSWORD
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
docker logs f1_garage_grafana
```

**Reiniciar contenedor:**

```powershell
docker restart f1_garage_grafana
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
docker logs f1_garage_grafana -f

# Reiniciar SQL Server
Restart-Service MSSQLSERVER

# Reiniciar Grafana
docker restart f1_garage_grafana

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
- [ ] Grafana container corriendo (puerto 3003)
- [ ] Data source `F1_Garage_DB` configurado
- [ ] Conexión probada (Database Connection OK)
- [ ] Query de prueba ejecutado exitosamente

---

## 📊 Resumen de Configuración

```yaml
Red:
  IP Local: 192.168.1.20
  Puerto SQL: 1433
  Puerto Grafana: 3003

Base de Datos:
  Nombre: f1_garage_tec
  Usuario: YOUR_READ_ONLY_DB_USER
  Password: YOUR_LOCAL_DB_PASSWORD

Grafana Data Source:
  Nombre: F1_Garage_DB
  Host: 192.168.1.20:1433
  Encrypt: true
  Auth: SQL Server Authentication
```

---

**Estado:** guía de referencia del proyecto; cada instalación debe validar su propia conexión.

## Nota de seguridad

Las versiones anteriores incluían credenciales históricamente expuestas. No existe confirmación de que sigan activas. Los valores públicos se sustituyeron por placeholders: no reutilices valores antiguos. Este cambio no elimina el historial previo.

`GRAFANA_ADMIN_PASSWORD` inicializa nuevas instancias; no restablece una contraseña en un volumen existente. No borres el volumen para intentar cambiarla.

Referencias: [provisioning de Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/) y [datasource MSSQL](https://grafana.com/docs/grafana/latest/datasources/mssql/configure/).
