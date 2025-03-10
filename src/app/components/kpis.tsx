"use client";

import React from "react";
import { useDataStore } from "@/store/dataStore";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ChartFooter from "./chartfooter";

// Função para formatar números com separadores de milhar
const formatNumber = (number: number | null | undefined) => {
  if (number === null || number === undefined) {
    return "N/A";
  }
  return number.toLocaleString("pt-BR");
};

// Função para calcular a data a partir de SE
const getDateFromSE = (se: number) => {
  const seStr = se.toString().padStart(6, "0"); // Garante formato "YYYYWW"
  const year = parseInt(seStr.substring(0, 4));
  const week = parseInt(seStr.substring(4, 6));
  const firstDayOfYear = new Date(year, 0, 1);
  const dayOfWeek = firstDayOfYear.getDay() - 1;
  const firstMondayOffset = (8 - dayOfWeek) % 7 || 7;
  const firstMonday = new Date(firstDayOfYear);
  firstMonday.setDate(firstDayOfYear.getDate() + firstMondayOffset - 1);
  const seMonday = new Date(firstMonday);
  seMonday.setDate(firstMonday.getDate() + (week - 1) * 7);
  const day = String(seMonday.getDate()).padStart(2, "0");
  const month = String(seMonday.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${seMonday.getFullYear()}`;
};

const KPI: React.FC = () => {
  const { stateData, cityData, selectedCity } = useDataStore();

  let currentData: { cases: number; last30DaysCases: number; yearlyCases: number } | null = null;
  let se: number = 0;

  if (cityData && cityData[0]) {
    // Ordena por SE decrescente para ter a semana mais recente primeiro
    const sortedCityHistory = [...cityData[0].data].sort((a, b) => b.SE - a.SE);
    const latestCityData = sortedCityHistory[0];
    se = latestCityData.SE;

    currentData = {
      cases: latestCityData.casos,
      last30DaysCases: sortedCityHistory
        .slice(0, 4)
        .reduce((total, item) => total + item.casos, 0),
      yearlyCases: sortedCityHistory
        .filter((item) => item.SE.toString().startsWith(se.toString().slice(0, 4)))
        .reduce((total, item) => total + item.casos, 0),
    };
  } else if (stateData && stateData[0]) {
    const latestStateData = stateData[0];
    se = latestStateData.SE;

    // Remove duplicatas de stateData antes de calcular
    const uniqueStateData = stateData.filter(
      (item, index, self) => self.findIndex((i) => i.SE === item.SE) === index
    );
    const sortedHistoricalData = [...uniqueStateData].sort((a, b) => b.SE - a.SE);
    const last4Weeks = sortedHistoricalData.slice(0, 4); // Pega as 4 semanas mais recentes

    currentData = {
      cases: latestStateData.total_week_cases,
      last30DaysCases: last4Weeks.reduce((total, item) => total + item.total_week_cases, 0),
      yearlyCases: uniqueStateData
        .filter((item) => item.SE.toString().startsWith(se.toString().slice(0, 4)))
        .reduce((total, item) => total + item.total_week_cases, 0),
    };
  }

  // Renderiza o skeleton se currentData for null
  if (currentData === null) {
    return (
      <div className="kpi-container">
        <h3 className="component-title first">
          <Skeleton width={200} height={24} />
        </h3>
        <div className="kpi-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="kpi-item">
              <p className="kpi-value">
                <Skeleton width={80} height={32} />
              </p>
              <p className="kpi-subtitle">
                <Skeleton width={100} height={16} />
              </p>
            </div>
          ))}
        </div>
        <div className="kpi-footer">
          <Skeleton width={150} height={16} />
        </div>
      </div>
    );
  }

  const dataObtida = getDateFromSE(se);

  return (
    <div className="kpi-container">
      <h3 className="component-title first">
        {selectedCity ? `Indicadores de ${selectedCity}` : "Indicadores de Minas Gerais"}
      </h3>
      <div className="kpi-grid">
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(currentData.cases)}</p>
          <p className="kpi-subtitle">Casos na última semana</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(currentData.last30DaysCases)}</p>
          <p className="kpi-subtitle">Casos nas últimas 4 semanas</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(currentData.yearlyCases)}</p>
          <p className="kpi-subtitle">Casos no ano</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-value kpi-alert-value">
            {stateData && stateData[0]
              ? formatNumber(stateData[0].cities_in_alert_state)
              : "N/A"}
          </p>
          <p className="kpi-subtitle">Cidades em alerta</p>
        </div>
      </div>
      <div className="kpi-footer">Dados atualizados em {dataObtida}</div>
      <ChartFooter/>
    </div>
  );
};

export default KPI;