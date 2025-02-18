"use client";

import { useEffect, useState } from "react";
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
import { useDataStore } from "@/store/dataStore"; // Importa o estado global

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChart2() {
  const { stateData } = useDataStore(); // Pega os dados do estado global

  // Extrai os dados atuais (posição 0 do array) ou define como null se não existir
  const currentStateData = stateData?.[0] || null;

  // Exibe a semana epidemiológica no console, se disponível
  useEffect(() => {
    if (currentStateData) {
      console.log("SE:", currentStateData.SE);
    }
  }, [currentStateData]);

  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: ChartDataset<"bar">[];
  }>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Verifica se os dados atuais e as cidades estão disponíveis
    if (!currentStateData || !Array.isArray(currentStateData.cities)) return;

    // Captura a última semana epidemiológica disponível
    const latestSE = currentStateData.cities[0]?.SE || "Desconhecido";

    // Ordena cidades por número de casos e pega as 15 com mais casos
    const sortedCities = currentStateData.cities
      .sort((a: any, b: any) => b.casos - a.casos)
      .slice(0, 15);

    const labels = sortedCities.map((city) => city.city);
    const casos = sortedCities.map((city) => city.casos);
    const backgroundColors = sortedCities.map((city) => getAlertColor(city.nivel));

    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Casos na Última Semana",
          data: casos,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) => color.replace("0.6", "1")),
          borderWidth: 1,
        },
      ],
    });
  }, [currentStateData]); // Atualiza o gráfico sempre que `currentStateData` mudar

  // Função para definir cores com base no nível de alerta
  const getAlertColor = (nivel: number) => {
    switch (nivel) {
      case 1:
        return "rgba(75, 192, 192, 0.6)"; // Verde (baixo risco)
      case 2:
        return "rgba(255, 206, 86, 0.6)"; // Amarelo (médio risco)
      case 3:
        return "rgba(255, 159, 64, 0.6)"; // Laranja (alto risco)
      case 4:
        return "rgba(255, 99, 132, 0.6)"; // Vermelho (alerta máximo)
      default:
        return "rgba(200, 200, 200, 0.6)"; // Cinza (desconhecido)
    }
  };

  return (
    <div className="barchart-container">
      <div className="barchart-wrapper">
        <Bar
          data={chartData}
          plugins={[ChartDataLabels]}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  font: { size: 14 },
                },
              },
              y: {
                display: false,
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
                formatter: (value, context) => {
                  return `${context.chart.data.labels[context.dataIndex]}: ${value}`;
                },
                offset: 10,
              },
            },
          }}
        />
      </div>
    </div>
  );
}