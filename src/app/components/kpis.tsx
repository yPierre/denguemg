"use client";

import React from "react";
import { useDataStore } from "@/store/dataStore";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // Importa o CSS padrão

// Função para formatar números com separadores de milhar
const formatNumber = (number: number | null | undefined) => {
  if (number === null || number === undefined) {
    return "N/A";
  }
  return number.toLocaleString("pt-BR");
};

const KPI: React.FC = () => {
  const { stateData, cityData, selectedCity } = useDataStore();

  let currentData: { cases: number; last30DaysCases: number; yearlyCases: number } | null = null;
  let se: number = 0;

  if (cityData && cityData[0]) {
    console.log("cityData[0] em KPIS.tsx:", cityData[0]);
    currentData = {
      cases: cityData[0].data[0].casos,
      last30DaysCases: cityData[0].data
        .slice(0, 4)
        .reduce((total, item) => total + item.casos, 0),
      yearlyCases: cityData[0].data
        .filter((item) =>
          item.SE.toString().startsWith(cityData[0].data[0].SE.toString().slice(0, 4))
        )
        .reduce((total, item) => total + item.casos, 0),
    };
    se = cityData[0].data[0].SE;
  } else if (stateData && stateData[0]) {
    currentData = {
      cases: stateData[0].total_week_cases,
      last30DaysCases: stateData
        .slice(0, 4)
        .reduce((total, item) => total + item.total_week_cases, 0),
      yearlyCases: stateData
        .filter((item) =>
          item.SE.toString().startsWith(stateData[0].SE.toString().slice(0, 4))
        )
        .reduce((total, item) => total + item.total_week_cases, 0),
    };
    se = stateData[0].SE;
  }

  const getDateFromSE = (se: number) => {
    const year = parseInt(se.toString().substring(0, 4));
    const week = parseInt(se.toString().substring(4, 6));
    const firstDayOfYear = new Date(year, 0, 1);
    const firstMonday = new Date(firstDayOfYear);
    firstMonday.setDate(firstDayOfYear.getDate() + ((1 - firstDayOfYear.getDay() + 7) % 7));
    const seMonday = new Date(firstMonday);
    seMonday.setDate(firstMonday.getDate() + (week - 1) * 7);
    const day = String(seMonday.getDate()).padStart(2, "0");
    const month = String(seMonday.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${seMonday.getFullYear()}`;
  };

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
          <p className="kpi-subtitle">Últimos 7 dias</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(currentData.last30DaysCases)}</p>
          <p className="kpi-subtitle">Últimos 30 dias</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(currentData.yearlyCases)}</p>
          <p className="kpi-subtitle">Acumulado no ano</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-value kpi-alert-value">
            {stateData && stateData[0]
              ? formatNumber(stateData[0].cities_in_alert_state)
              : "N/A"}
          </p>
          <p className="kpi-subtitle">Cidades em nível de alerta</p>
        </div>
      </div>
      <div className="kpi-footer">Atualizado em {dataObtida}</div>
    </div>
  );
};

export default KPI;