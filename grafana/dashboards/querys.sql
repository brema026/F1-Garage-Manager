-- PANEL 1
SELECT
  posicion,
  equipo,
  carro,
  vrecta,
  vcurva,
  penalizacion,
  tiempo_segundos
FROM dbo.v_grafana_ranking_simulacion
WHERE circuito = '$circuito'
  AND id_simulacion = $simulation_id 
ORDER BY posicion;

-- PANEL 2
SELECT
  fecha_simulacion AS time,
  CAST(tiempo_segundos AS DECIMAL(12,3)) AS value,
  CONCAT('Sim ', CAST(id_simulacion AS VARCHAR(10))) AS sim_label,
  circuito AS circuito_label
FROM dbo.v_grafana_carro_historial
WHERE carro = '$carro'
ORDER BY fecha_simulacion;

-- PANEL 3
SELECT 
  carro AS category,
  CAST(tiempo_segundos AS DECIMAL(12,3)) AS tiempo_segundos,
  CAST(p_total AS INT) AS p_total,
  CAST(a_total AS INT) AS a_total,
  CAST(m_total AS INT) AS m_total,
  circuito,
  equipo
FROM dbo.v_grafana_tiempo_vs_pam
WHERE circuito = '$circuito'
  AND id_simulacion = $simulation_id
  AND carro = '$carro'
ORDER BY tiempo_segundos ASC;