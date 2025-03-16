"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { useDataStore } from "@/store/dataStore";
import ChartHeader from "./chartheader";
import Skeleton from "react-loading-skeleton";
import ToggleSwitch from "./toggleswitch";
import "react-loading-skeleton/dist/skeleton.css";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, annotationPlugin);

interface StateDataEntry {
  SE: number;
  total_week_cases: number;
  total_notif_accum_year: number;
}

interface CityDataEntry {
  SE: number;
  casos: number;
  notif_accum_year: number;
}

type DataEntry = StateDataEntry | CityDataEntry;

export default function LineChart() {
  const { stateData, cityData } = useDataStore();
  const [dataType, setDataType] = useState<'absolute' | 'per100k' | 'weekly' | 'accumulated'>('weekly');
  const [chartData, setChartData] = useState<{
    labels: number[];
    datasets: {
      label: string;
      data: (number | null)[];
      fill: boolean;
      borderColor: string;
      backgroundColor: string;
      pointRadius: number;
      hidden: boolean;
    }[];
  } | null>(null);
  const [latestWeek, setLatestWeek] = useState<number>(0);

  useEffect(() => {
    const data: DataEntry[] = cityData ? cityData[0].data : (stateData || []);
    if (!data || data.length === 0) return;

    const sortedData = [...data].sort((a, b) => a.SE - b.SE);

    const isCity = sortedData.length > 0 && 'casos' in sortedData[0];
    const valueKey = dataType === 'accumulated' 
      ? (isCity ? 'notif_accum_year' : 'total_notif_accum_year') 
      : (isCity ? 'casos' : 'total_week_cases');

    const groupedData: { [year: number]: number[] } = {};
    sortedData.forEach((entry) => {
      const year = Math.floor(entry.SE / 100);
      const week = entry.SE % 100;
      const value = entry[valueKey as keyof DataEntry] as number;

      groupedData[year] = groupedData[year] || Array(52).fill(null);
      groupedData[year][week - 1] = value;
    });

    // Ordenar os anos do mais antigo para o mais recente
    const years = Object.keys(groupedData).map(Number).sort((a, b) => a - b);
    const latestYear = years.length > 0 ? years[years.length - 1] : null;

    // Calcular semana mais recente
    let latestWeekCalc = 0;
    if (latestYear && groupedData[latestYear]) {
      const latestYearData = groupedData[latestYear];
      latestWeekCalc = latestYearData.findLastIndex((value) => value !== null);
    }
    setLatestWeek(latestWeekCalc);

    // Cores
    const colors = [
      "#EE3377B3",
      "#CC3311B3",
      "#EE7733B3",
      "#009988B3",
      "#33BBEEB3",
      "#0077BBB3",
      "#BBBBBBB3",
      "#44AA99B3",
    ];

    // Criar datasets ordenados do mais antigo para o mais recente
    const datasets = years.map((year, index) => {
      const isLatestYear = year === latestYear;
      return {
        label: `${year}`,
        data: groupedData[year],
        fill: false,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length],
        pointRadius: isLatestYear ? 3 : 1,
        borderWidth: 3,
        hidden: false,
      }
    });

    // Inverter a ordem dos datasets para renderizar o ano mais recente por cima
    const reversedDatasets = [...datasets].reverse();

    setChartData({
      labels: Array.from({ length: 52 }, (_, i) => i + 1),
      datasets: reversedDatasets,
    });
  }, [stateData, cityData, dataType]);

  // Renderiza o skeleton enquanto os dados estão sendo buscados
  if (!stateData && !cityData) {
    return (
      <div className="linechart-c">
        <h3 className="component-title">
          <Skeleton width={200} height={24} />
        </h3>
        <div className="linechart-container">
          <Skeleton height={300} />
        </div>
      </div>
    );
  }

  return (
    <div className="linechart-c">
      <ChartHeader title="Casos Semanais por Ano">
        <ToggleSwitch
          options={[
            {
              type: 'weekly',
              label: 'Casos Semanais por ano',
              tooltip: 'Mostra o número de casos semanais reportados'
            },
            {
              type: 'accumulated',
              label: 'Casos Acumulados por ano',
              tooltip: 'Mostra o número de casos acumulados por ano reportados'
            }
          ]}
          onToggleChange={(type) => setDataType(type)}
        />
      </ChartHeader>

      {chartData ? (
        <div className="linechart-container">
          <div className="linechart-wrapper">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: "index",
                intersect: false,
              },
              scales: {
                x: {
                  title: { display: true, color: "#6B6B6B", text: "Semana Epidemiológica" },
                },
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Casos" },
                },
              },
              plugins: {
                legend: {
                  reverse: true,
                  // Remove a propriedade reverse para manter a ordem correta na legenda
                  onClick: (e, legendItem, legend) => {
                    const index = legendItem.datasetIndex;
                    if (index === undefined) return;
                    const chart = legend.chart;
                    const meta = chart.getDatasetMeta(index);
                    meta.hidden = !meta.hidden;
                    chart.update();
                  },
                },
                tooltip: {
                  callbacks: {
                    title: (context) => `Semana ${context[0].label}`,
                    label: (context) => {
                      const datasetLabel = context.dataset.label || "";
                      const value = context.raw;
                      return dataType === 'accumulated'
                        ? `${datasetLabel}: ${value} casos acumulados`
                        : `${datasetLabel}: ${value} casos`;
                    },
                  },
                },
                annotation: {
                  annotations: {
                    latestWeekLine: {
                      type: "line",
                      xMin: latestWeek,
                      xMax: latestWeek,
                      borderColor: "red",
                      borderWidth: 2,
                      label: {
                        display: true,
                        content: "Semana Atual",
                        position: "end",
                        backgroundColor: "rgba(255, 0, 0, 0.7)",
                        color: "white",
                        font: { size: 12 },
                      },
                    },
                  },
                },
              },
            }}
          />
          </div>
        </div>
      ) : (
        <div className="linechart-container">
          <Skeleton height={250} />
        </div>
      )}
    </div>
  );
}