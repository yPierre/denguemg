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
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, annotationPlugin);

interface StateDataEntry {
  SE: number;
  total_week_cases: number;
}

interface CityDataEntry {
  SE: number;
  casos: number;
}

type DataEntry = StateDataEntry | CityDataEntry;

export default function LineChart() {
  const { stateData, cityData } = useDataStore();
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
    if (!data) return;

    const seData: DataEntry[] = data.map((entry) => ({
      SE: entry.SE,
      total_week_cases: "casos" in entry ? entry.casos : entry.total_week_cases,
    }));

    const groupedData: { [year: number]: number[] } = {};
    seData.forEach((entry) => {
      const year = Math.floor(entry.SE / 100);
      const week = entry.SE % 100;
      const totalCases = "casos" in entry ? entry.casos : entry.total_week_cases;
      groupedData[year] = groupedData[year] || Array(52).fill(null);
      groupedData[year][week - 1] = totalCases;
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
      "rgba(75, 192, 192, 0.7)",
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 159, 64, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "#1A73E8",
      "rgba(201, 203, 207, 0.8)",
      "rgba(75, 192, 192, 0.8)",
    ];

    // Criar datasets ordenados do mais antigo para o mais recente
    const datasets = years.map((year, index) => ({
      label: `${year}`,
      data: groupedData[year],
      fill: false,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length],
      pointRadius: 3,
      hidden: false,
    }));

    // Inverter a ordem dos datasets para renderizar o ano mais recente por cima
    const reversedDatasets = [...datasets].reverse();

    setChartData({
      labels: Array.from({ length: 52 }, (_, i) => i + 1),
      datasets: reversedDatasets,
    });
  }, [stateData, cityData]);

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
      <h3 className="component-title">Casos Semanais por Ano</h3>

      {chartData ? (
        <div className="linechart-container">
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
                      return `${datasetLabel}: ${value} casos`;
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
      ) : (
        <div className="linechart-container">
          <Skeleton height={250} />
        </div>
      )}
    </div>
  );
}