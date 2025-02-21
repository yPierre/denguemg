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

// Registrar componentes do Chart.js
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function LineChart() {
  const { stateData } = useDataStore(); // Pega os dados do estado global
  const [chartData, setChartData] = useState<any>(null);

  // Processa os dados para o gráfico
  useEffect(() => {
    if (!stateData) return;

    //console.log("📊 Processando dados recebidos(linechart)...");

    // Extrair os dados de semanas epidemiológicas (SE) e casos
    const seData = stateData.map((entry: any) => ({
      SE: entry.SE,
      total_week_cases: entry.total_week_cases,
    }));

    // Agrupar dados por ano
    const groupedData: { [year: number]: number[] } = {};
    seData.forEach(({ SE, total_week_cases }) => {
      const year = Math.floor(SE / 100); // Ex: 202452 -> 2024
      const week = SE % 100; // Ex: 202452 -> 52

      if (!groupedData[year]) {
        groupedData[year] = Array(52).fill(null); // Cria um array com 52 semanas (inicialmente nulo)
      }

      groupedData[year][week - 1] = total_week_cases; // Insere os casos na semana correspondente
    });

    //console.log("📅 Dados agrupados por ano(linechart):", groupedData);

    // Nova paleta de cores
    const colors = [
      "rgba(75, 192, 192, 0.8)", // Azul esverdeado
      "rgba(255, 99, 132, 0.8)", // Vermelho rosado
      "rgba(54, 162, 235, 0.8)", // Azul claro
      "rgba(255, 159, 64, 0.8)", // Laranja
      "rgba(153, 102, 255, 0.8)", // Roxo
      "rgba(255, 205, 86, 0.8)", // Amarelo
      "rgba(201, 203, 207, 0.8)", // Cinza
      "rgba(75, 192, 192, 0.8)", // Azul esverdeado (repetido para mais anos)
    ];

    // Criar datasets para cada ano
    const datasets = Object.entries(groupedData).map(([year, cases], index) => {
      //console.log(`🎨 Criando dataset para o ano ${year}, dados(linechart):`, cases);

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

    console.log("📊 Dados finais para o gráfico(linechart):", {
      labels: Array.from({ length: 52 }, (_, i) => i + 1),
      datasets,
    });

    setChartData({
      labels: Array.from({ length: 52 }, (_, i) => i + 1), // Semanas de 1 a 52
      datasets,
    });
  }, [stateData]); // Atualiza o gráfico sempre que `stateData` mudar

  // Exibe um indicador de carregamento enquanto os dados estão sendo buscados
  if (!stateData) {
    return <p className="text-center">⏳ Carregando dados...</p>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h3 className="linechart-title">Casos Semanais por Ano</h3>

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
                    title: { display: true, text: "Semana Epidemiológica" },
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