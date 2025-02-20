"use client";

import React from "react";
import { useDataStore } from "@/store/dataStore"; // Importa o estado global

// Função para formatar números (ex: 1000 -> 1.000)

const KPI: React.FC = () => {
  const { stateData, cityData, selectedCity } = useDataStore(); // Pega os dados do estado global

  console.log("Selected City(kpi): ", selectedCity);
  console.log("cityData(kpi): ", cityData);
  console.log("stateData(kpi):", stateData);
  const currentData = selectedCity ? cityData : stateData;
  // Verificar se os dados necessários estão disponíveis
  if (!currentData) {
    return <div>Carregando KPIs...</div>;
  }

  // Dados inventados para os últimos 30 dias e acumulado no ano
  const last30DaysCases = 1500; // Exemplo: 1500 casos nos últimos 30 dias
  const yearlyCases = 12000; // Exemplo: 12000 casos acumulados no ano

  return (
    <div className="kpi-container">
      {/* Título principal */}
      <div className="kpi-main-title">
        {selectedCity ? `Dados de ${selectedCity}` : "Dados do Estado"}
      </div>
      {/* Valores e descrições */}
      <div className="kpi-grid">
        {/* Últimos 7 dias */}
        <div className="kpi-item">
          <p className="kpi-value">{currentData ? currentData[0].total_week_cases : "N/A"}</p>
          <p className="kpi-subtitle">Últimos 7 dias</p>
        </div>

        {/* Últimos 30 dias */}
        <div className="kpi-item">
          <p className="kpi-value">{last30DaysCases}</p>
          <p className="kpi-subtitle">Últimos 30 dias</p>
        </div>

        {/* Acumulado no ano */}
        <div className="kpi-item">
          <p className="kpi-value">{yearlyCases}</p>
          <p className="kpi-subtitle">Acumulado</p>
        </div>

        {/* Cidades em nível de alerta */}
        <div className="kpi-item">
          <p className="kpi-value kpi-alert-value">
            {stateData[0].cities_in_alert_state}
          </p>
          <p className="kpi-subtitle">Cidades em nível de alerta</p>
        </div>
      </div>
    </div>
  );
};

export default KPI;