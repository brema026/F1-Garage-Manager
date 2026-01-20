USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_listar_categorias
AS
BEGIN
  SET NOCOUNT ON;

  SELECT category_id, nombre
  FROM dbo.part_category
  ORDER BY nombre;
END;
GO