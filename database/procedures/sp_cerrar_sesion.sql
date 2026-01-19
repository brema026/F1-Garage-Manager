USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_cerrar_sesion
    @id_sesion NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.sesion 
    WHERE id_sesion = @id_sesion;
END
GO