-- circuito
SELECT DISTINCT
  circuito AS value
FROM dbo.v_grafana_carro_historial
ORDER BY value;

-- simulation_id
SELECT
  s.id_simulacion
FROM dbo.simulacion s
JOIN dbo.circuito c ON c.id_circuito = s.id_circuito
WHERE c.nombre = '$circuito'
ORDER BY s.id_simulacion;

-- carro
SELECT DISTINCT
  CONCAT(equipo, ' - ', carro) AS __text,
  id_carro AS __value
FROM dbo.v_grafana_carro_historial
ORDER BY __text;
