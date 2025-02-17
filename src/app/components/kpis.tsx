"use client";

import React, { useEffect, useState } from "react";

// Definindo tipos para os dados do estado
interface StateData {
  total_week_cases: number;
  total_pop: number;
  cities_in_alert_state: number;
  cities: {
    city: string;
    geocode: number;
    casos: number;
    nivel: number;
  }[];
}

const KPI: React.FC = () => {
  const [stateData, setStateData] = useState<StateData | null>(null);

  // Carregar os dados do estado (última semana) do MongoDB
  useEffect(() => {
    fetch("/api/state")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStateData(data[0]);
        } else {
          console.error("Dados inválidos ou vazios:", data);
        }
      })
      .catch((error) => console.error("Erro ao carregar dados do estado:", error));
  }, []);

  if (!stateData) {
    return <div>Carregando KPIs...</div>;
  }

  // Dados inventados para os últimos 30 dias e acumulado no ano
  const last30DaysCases = 1500; // Exemplo: 1500 casos nos últimos 30 dias
  const yearlyCases = 12000; // Exemplo: 12000 casos acumulados no ano

  return (
    <div style={styles.container}>
      {/* Título principal */}
      <h2 style={styles.mainTitle}>CASOS CONFIRMADOS</h2>

      {/* Valores e descrições */}
      <div style={styles.grid}>
        {/* Últimos 7 dias */}
        <div style={styles.item}>
          <p style={styles.value}>{stateData.total_week_cases}</p>
          <p style={styles.subtitle}>Últimos 7 dias</p>
        </div>

        {/* Últimos 30 dias */}
        <div style={styles.item}>
          <p style={styles.value}>{last30DaysCases}</p>
          <p style={styles.subtitle}>Últimos 30 dias</p>
        </div>

        {/* Acumulado no ano */}
        <div style={styles.item}>
          <p style={styles.value}>{yearlyCases}</p>
          <p style={styles.subtitle}>Acumulado</p>
        </div>

        {/* Cidades em nível de alerta */}
        <div style={styles.item}>
          <p style={styles.value}>{stateData.cities_in_alert_state}</p>
          <p style={styles.subtitle}>Cidades em nível de alerta</p>
        </div>
      </div>
    </div>
  );
};

// Estilos para o componente
const styles = {
  container: {
    padding: "5px",
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
    maxWidth: "600px", // Largura máxima para ocupar menos espaço
    margin: "0 auto", // Centralizar na tela
  },
  mainTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center" as "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)", // 2 colunas
    gap: "20px",
  },
  item: {
    textAlign: "center" as "center",
  },
  value: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#000000",
    margin: "0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "5px 0 0 0",
  },
};

export default KPI;