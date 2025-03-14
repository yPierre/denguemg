"use client";

import { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  ChartDataset,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartHeader from "./chartheader";
import { Context } from 'chartjs-plugin-datalabels';
import { useDataStore } from "@/store/dataStore";
import Skeleton from "react-loading-skeleton";
import ToggleSwitch from "./toggleswitch";
import "react-loading-skeleton/dist/skeleton.css";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface CityData {
  city: string;
  geocode: number;
  casos: number;
  p_inc100k: number;
  nivel: number;
}

export default function BarChart2() {
  const { stateData } = useDataStore();
  const [dataType, setDataType] = useState<'absolute' | 'per100k'>('absolute');
  const currentStateData = stateData?.[0] || null;
  const chartWrapperRef = useRef<HTMLDivElement>(null); // Referência para medir a altura

  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: ChartDataset<"bar">[];
  }>({
    labels: [],
    datasets: [],
  });

  const getColorByCasos = (casos: number) => {
    if (casos >= 2000) return "#800020";
    if (casos >= 1000) return "#FF0000";
    if (casos >= 500) return "#FF4500";
    if (casos >= 100) return "#FFA500";
    if (casos >= 50) return "#FFD700";
    return "#FFFF99";
  };

  const getColorByIncidencia = (incidencia: number) => {
    if (incidencia >= 300) return "#800020";
    if (incidencia >= 200) return "#FF0000";
    if (incidencia >= 100) return "#FF4500";
    if (incidencia >= 50) return "#FFA500";
    if (incidencia >= 10) return "#FFD700";
    if (incidencia >= 0) return "#FFFF99";
    return "#C8C8C8";
  };

  useEffect(() => {
    if (!currentStateData || !Array.isArray(currentStateData.cities) || !chartWrapperRef.current) return;

    const dataField: keyof CityData = dataType === 'per100k' ? 'p_inc100k' : 'casos';
    const labelText = dataType === 'per100k' ? 'Casos por 100k habitantes' : 'Casos na Última Semana';

    // Ordena cidades por número de casos
    const sortedCities = currentStateData.cities
      .sort((a: CityData, b: CityData) => b[dataField] - a[dataField]);

    // Calcula quantas barras cabem no espaço disponível
    const barThickness = 25; // Largura fixa das barras em pixels
    const chartHeight = chartWrapperRef.current.clientHeight || 300; // Altura padrão se não disponível
    const maxBars = Math.floor(chartHeight / (barThickness + 5)); // 5px de espaço entre barras
    const visibleCities = sortedCities.slice(0, Math.min(maxBars, sortedCities.length));

    const labels = visibleCities.map((city: CityData) => city.city);
    const dataValues = visibleCities.map((city: CityData) => 
      dataType === 'per100k' ? Number(city[dataField].toFixed(2)) : city[dataField]
    );
    const backgroundColors = visibleCities.map((city: CityData) => 
      dataType === 'per100k' ? getColorByIncidencia(city.p_inc100k) : getColorByCasos(city.casos)
    );

    setChartData({
      labels: labels,
      datasets: [
        {
          label: labelText,
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    });
  }, [currentStateData, dataType]);

  if (!stateData) {
    return (
      <div className="barchart-component">
        <h3 className="component-title">
          <Skeleton />
        </h3>
        <div className="barchart-container">
          <div className="barchart-wrapper">
            <Skeleton />
          </div>
        </div>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        title: { 
          display: true, 
          text: dataType === 'per100k' 
            ? 'Casos por 100.000 habitantes' 
            : 'Número absoluto de casos'
        },
        beginAtZero: true,
        ticks: { 
          font: { 
            size: 12 
          } 
        },
      },
      y: { 
        display: false 
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: "start",
        align: "end",
        color: "black",
        font: {
          size: 12,
          weight: "bold",
        },
        formatter: (value: number, context: Context) => {
          const labels = context.chart.data.labels as string[] | undefined;
          return labels ? `${labels[context.dataIndex]}: ${value}` : `${value}`;
        },
        offset: 10,
      },
    },
    barThickness: 20, // Largura fixa das barras
  } as const;

  return (
    <div className="barchart-component">
      <ChartHeader title="Cidades">
        <ToggleSwitch
          options={[
            {
              type: 'absolute',
              label: 'Total de Casos',
              tooltip: 'Mostrar o número total de casos reportados nas cidades.'
            },
            {
              type: 'per100k',
              label: 'Por 100 mil habitantes',
              tooltip: 'Mostrar o número de casos por 100.000 habitantes, ajustado pela população das cidades.'
            }
          ]}
          onToggleChange={(type: 'absolute' | 'per100k' | 'weekly' | 'accumulated') => {
            if (type === 'absolute' || type === 'per100k') {
              setDataType(type);
            }
          }}
        />
      </ChartHeader>
      <div className="barchart-container">
        <div className="barchart-wrapper" ref={chartWrapperRef}>
          <Bar
            data={chartData}
            plugins={[ChartDataLabels]}
            options={options}
          />
        </div>
      </div>
    </div>
  );
}