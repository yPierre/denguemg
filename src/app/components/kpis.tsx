"use client";

import React from "react";
import { useDataStore } from "@/store/dataStore"; // Importa o estado global

// Função para formatar números com separadores de milhar
const formatNumber = (number: number) => {
  if (number === null || number === undefined) {
    return "N/A";
  }
  return number.toLocaleString("pt-BR"); // Formata com separadores de milhar
};


const KPI: React.FC = () => {
  const { stateData, cityData, selectedCity } = useDataStore(); // Pega os dados do estado global

  let currentData;
  let se: number = 0;

  if (cityData) {
    console.log("cityData[0] em KPIS.tsx:", cityData[0]);
    currentData = {
      cases: cityData[0].data[0].casos, // Casos dos últimos 7 dias
      last30DaysCases: cityData[0].data
        .slice(0, 4) // Últimas 4 semanas
        .reduce((total, item) => total + item.casos, 0), // Soma dos casos
      yearlyCases: cityData[0].data
        .filter(item => item.SE.toString().startsWith(cityData[0].data[0].SE.toString().slice(0, 4))) // Filtra pelo ano
        .reduce((total, item) => total + item.casos, 0), // Soma dos casos
    };
    se = cityData[0].data[0].SE; // Semana epidemiológica atual
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
    se = stateData[0].SE; // Semana epidemiológica atual
  }

  const getDateFromSE = (se: number) => {
    const year = parseInt(se.toString().substring(0, 4)); // Extrai o ano
    const week = parseInt(se.toString().substring(4, 6)); // Extrai a semana
  
    // Cria uma data para o primeiro dia do ano
    const firstDayOfYear = new Date(year, 0, 1);
  
    // Calcula o número de dias para a primeira segunda-feira do ano
    const firstMonday = new Date(firstDayOfYear);
    firstMonday.setDate(firstDayOfYear.getDate() + ((1 - firstDayOfYear.getDay() + 7) % 7));
  
    // Calcula a data da segunda-feira da semana epidemiológica
    const seMonday = new Date(firstMonday);
    seMonday.setDate(firstMonday.getDate() + (week - 1) * 7);
  
    // Formata a data como dd/MM/yyyy
    const day = String(seMonday.getDate()).padStart(2, "0");
    const month = String(seMonday.getMonth() + 1).padStart(2, "0");
    const formattedDate = `${day}/${month}/${seMonday.getFullYear()}`;
  
    return formattedDate;
  };

  // Verificar se os dados necessários estão disponíveis
  if (currentData === null || currentData === undefined) {
    return <div>Carregando KPIs...</div>;
  }

  // Gera a data a partir da SE
  const dataObtida = getDateFromSE(se);

  return (
    <div className="kpi-container">
      {/* Título principal */}
      <h3 className="component-title first">
        {selectedCity ? `Indicadores de ${selectedCity}` : "Indicadores de Minas Gerais"}
      </h3>
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
          <p className="kpi-subtitle">Acumulado no ano</p>
        </div>

        {/* Cidades em nível de alerta */}
        <div className="kpi-item">
          <p className="kpi-value kpi-alert-value">
            {stateData && stateData[0] ? formatNumber(stateData[0].cities_in_alert_state) : "N/A"}
          </p>
          <p className="kpi-subtitle">Cidades em nível de alerta</p>
        </div>
      </div>
      {/* Data de obtenção dos dados */}
      <div className="kpi-footer">
        Atualizado em {dataObtida}
      </div>
    </div>
  );
};

export default KPI;