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
import { useDataStore } from "@/store/dataStore"; // Importa o estado global

interface StateDataEntry {
  SE: number;
  total_week_cases: number;
}

interface CityDataEntry {
  SE: number;
  casos: number;
}

type DataEntry = StateDataEntry | CityDataEntry;

// Registrar componentes do Chart.js
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function LineChart() {
  const { stateData, cityData } = useDataStore(); // Pega os dados do estado global e da cidade
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

  // Processa os dados para o gráfico
  useEffect(() => {
    const data: DataEntry[] = cityData ? cityData[0].data : (stateData || []); // Usa cityData se disponível, senão stateData

    if (!data) return;

    // Extrair os dados de semanas epidemiológicas (SE) e casos
    const seData: DataEntry[] = data.map((entry) => ({
      SE: entry.SE,
      total_week_cases: "casos" in entry ? entry.casos : entry.total_week_cases, // Ajusta o campo de casos
    }));

    // Agrupar dados por ano
    const groupedData: { [year: number]: number[] } = {};
    seData.forEach((entry) => {
      const year = Math.floor(entry.SE / 100); // Ex: 202452 -> 2024
      const week = entry.SE % 100; // Ex: 202452 -> 52
    
      // Garante que o total_week_cases existe no entry, independente do tipo
      const totalCases = "casos" in entry ? entry.casos : entry.total_week_cases;
    
      if (!groupedData[year]) {
        groupedData[year] = Array(52).fill(null); // Cria um array com 52 semanas (inicialmente nulo)
      }
    
      groupedData[year][week - 1] = totalCases; // Insere os casos na semana correspondente
    });

    // Nova paleta de cores
    const colors = [
      "rgba(75, 192, 192, 0.7)", // Azul esverdeado
      "rgba(255, 99, 132, 0.7)", // Vermelho rosado
      "rgba(54, 162, 235, 0.7)", // Azul claro
      "rgba(255, 159, 64, 0.7)", // Laranja
      "rgba(153, 102, 255, 0.7)", // Roxo
      "#1A73E8", // Amarelo | 2025 -> atualizado para azul
      "rgba(201, 203, 207, 0.8)", // Cinza
      "rgba(75, 192, 192, 0.8)", // Azul esverdeado (repetido para mais anos)
    ];

    // Criar datasets para cada ano
    const datasets = Object.entries(groupedData).map(([year, cases], index) => {
      return {
        label: `${year}`,
        data: cases,
        fill: false,
        borderColor: colors[index % colors.length], // Usa a paleta de cores
        backgroundColor: colors[index % colors.length],
        pointRadius: 3,
        hidden: false, // Inicialmente, todas as linhas estão visíveis
      };
    });

    setChartData({
      labels: Array.from({ length: 52 }, (_, i) => i + 1), // Semanas de 1 a 52
      datasets,
    });
  }, [stateData, cityData]); // Atualiza o gráfico sempre que `stateData` ou `cityData` mudar

  // Exibe um indicador de carregamento enquanto os dados estão sendo buscados
  if (!stateData && !cityData) {
    return <p className="text-center">⏳ Carregando dados...</p>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h3 className="component-title">Casos Semanais por Ano</h3>

      {chartData ? (
        <div className="linechart-container">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: "index", // Permite interagir com múltiplos datasets ao mesmo tempo
                intersect: false, // Exibe o tooltip ao passar o mouse sobre a linha
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
                    title: (context) => `Semana ${context[0].label}`, // Título do tooltip
                    label: (context) => {
                      const datasetLabel = context.dataset.label || "";
                      const value = context.raw;
                      return `${datasetLabel}: ${value} casos`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <p className="text-center">⏳ Carregando dados...</p>
      )}
    </div>
  );
}