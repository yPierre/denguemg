"use client";

import React from "react";
import { useDataStore } from "@/store/dataStore"; // Importa o estado global

// Função para formatar números com separadores de milhar
const formatNumber = (number) => {
  if (number === null || number === undefined) {
    return "N/A";
  }
  return number.toLocaleString("pt-BR"); // Formata com separadores de milhar
};

const KPI: React.FC = () => {
  const { stateData, cityData, selectedCity } = useDataStore(); // Pega os dados do estado global

  let currentData;

  if (cityData) {
    currentData = {
      cases: cityData[0].data[0].casos, // Casos dos últimos 7 dias
      last30DaysCases: cityData[0].data
        .slice(0, 4) // Últimas 4 semanas
        .reduce((total, item) => total + item.casos, 0), // Soma dos casos
      yearlyCases: cityData[0].data
        .filter(item => item.SE.toString().startsWith(cityData[0].data[0].SE.toString().slice(0, 4))) // Filtra pelo ano
        .reduce((total, item) => total + item.casos, 0), // Soma dos casos
    };
  } else if (stateData) {
    currentData = {
      cases: stateData[0].total_week_cases, // Casos dos últimos 7 dias
      last30DaysCases: stateData
        .slice(0, 4) // Últimas 4 semanas
        .reduce((total, item) => total + item.total_week_cases, 0), // Soma dos casos
      yearlyCases: stateData
        .filter(item => item.SE.toString().startsWith(stateData[0].SE.toString().slice(0, 4))) // Filtra pelo ano
        .reduce((total, item) => total + item.total_week_cases, 0), // Soma dos casos
    };
  }

  // Verificar se os dados necessários estão disponíveis
  if (currentData === null || currentData === undefined) {
    return <div>Carregando KPIs...</div>;
  }

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
          <p className="kpi-value">{formatNumber(currentData.cases)}</p>
          <p className="kpi-subtitle">Últimos 7 dias</p>
        </div>

        {/* Últimos 30 dias */}
        <div className="kpi-item">
          <p className="kpi-value">
            {formatNumber(currentData.last30DaysCases)}
          </p>
          <p className="kpi-subtitle">Últimos 30 dias</p>
        </div>

        {/* Acumulado no ano */}
        <div className="kpi-item">
          <p className="kpi-value">
            {formatNumber(currentData.yearlyCases)}
          </p>
          <p className="kpi-subtitle">Acumulado</p>
        </div>

        {/* Cidades em nível de alerta */}
        <div className="kpi-item">
          <p className="kpi-value kpi-alert-value">
            {stateData && stateData[0] ? formatNumber(stateData[0].cities_in_alert_state) : "N/A"}
          </p>
          <p className="kpi-subtitle">Cidades em nível de alerta</p>
        </div>
      </div>
    </div>
  );
};

export default KPI;