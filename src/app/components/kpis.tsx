"use client";

import React from "react";
import { useDataStore } from "@/store/dataStore";
import { computeKpis, getDateFromSE } from "@/utils/kpis";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ChartFooter from "./chartfooter";

const formatNumber = (number: number | null | undefined) => {
  if (number === null || number === undefined) {
    return "N/A";
  }
  return number.toLocaleString("pt-BR");
};

const KPI: React.FC = () => {
  const { stateData, cityData, selectedCity } = useDataStore();

  const summary = computeKpis(cityData, stateData);

  // Skeleton
  if (summary === null) {
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

  const { cases, last30DaysCases, yearlyCases, se } = summary;
  const dataObtida = getDateFromSE(se);

  return (
    <div className="kpi-container">
      <h3 className="component-title first">
        {selectedCity ? `Indicadores de ${selectedCity}` : "Indicadores de Minas Gerais"}
      </h3>
      <div className="kpi-grid">
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(cases)}</p>
          <p className="kpi-subtitle">Casos na última semana</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(last30DaysCases)}</p>
          <p className="kpi-subtitle">Casos nas últimas 4 semanas</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-value">{formatNumber(yearlyCases)}</p>
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