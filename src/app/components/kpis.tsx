"use client";

import React from "react";
import { useDataStore } from "@/store/dataStore"; // Importa o estado global

// Função para formatar números (ex: 1000 -> 1.000)
const formatNumber = (num: number): string => {
  return num.toLocaleString("pt-BR");
};

const KPI: React.FC = () => {
  const { stateData } = useDataStore(); // Pega os dados do estado global

  // Verificar se os dados necessários estão disponíveis
  if (!stateData) {
    return <div>Carregando KPIs...</div>;
  }

  // Dados inventados para os últimos 30 dias e acumulado no ano
  const last30DaysCases = 1500; // Exemplo: 1500 casos nos últimos 30 dias
  const yearlyCases = 12000; // Exemplo: 12000 casos acumulados no ano

  return (
    <div className="kpi-container">
      {/* Título principal */}
      <h2 className="kpi-main-title">CASOS CONFIRMADOS</h2>

      {/* Valores e descrições */}
      <div className="kpi-grid">
        {/* Últimos 7 dias */}
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(stateData[0].total_week_cases)}</p>
          <p className="kpi-subtitle">Últimos 7 dias</p>
        </div>

        {/* Últimos 30 dias */}
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(last30DaysCases)}</p>
          <p className="kpi-subtitle">Últimos 30 dias</p>
        </div>

        {/* Acumulado no ano */}
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(yearlyCases)}</p>
          <p className="kpi-subtitle">Acumulado</p>
        </div>

        {/* Cidades em nível de alerta */}
        <div className="kpi-item">
          <p className="kpi-value kpi-alert-value">
            {formatNumber(stateData[0].cities_in_alert_state)}
          </p>
          <p className="kpi-subtitle">Cidades em nível de alerta</p>
        </div>
      </div>
    </div>
  );
};

export default KPI;