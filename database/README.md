# Base de Datos – F1 Garage Manager

Scripts SQL correspondientes a la base de datos del proyecto

## Contenido

- **Schema_Inicial_DB.sql**
  - Definición del esquema inicial en SQL Server.
  - Incluye tablas, claves primarias (PK), claves foráneas (FK) y restricciones básicas.
  - El esquema está alineado con el modelo Entidad–Relación y el diagrama Crow’s Foot del proyecto.

- **Inserts_Dummy.sql**
  - Scripts de inserción de datos dummy.
  - Utilizados únicamente para pruebas, verificación de relaciones y demostración del sistema.
  - Los inserts deben ejecutarse por bloques y en orden.

## Uso recomendado

1. Ejecutar el archivo `Schema_Inicial_DB.sql` en SQL Server.
2. Ejecutar el archivo `Inserts_Dummy.sql` por secciones para poblar la base con datos de prueba.
3. Verificar el correcto funcionamiento mediante consultas `SELECT`.
