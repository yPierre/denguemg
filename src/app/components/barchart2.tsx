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
import ChartDataLabels from "chartjs-plugin-datalabels"; // Importe o plugin

// Registrar componentes do Chart.js (exceto o plugin datalabels)
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Tipagem dos dados vindos da API
interface CityData {
  city: string;
  geocode: number;
  casos: number;
  nivel: number;
}

interface StateData {
  total_week_cases: number;
  total_pop: number;
  cities_in_alert_state: number;
  cities: CityData[];
}

export default function BarChart2() {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: ChartDataset<"bar">[];
  }>({
    labels: [],
    datasets: [],
  });

  const [chartTitle, setChartTitle] = useState("Casos de Dengue");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/state");
        const stateDataArray = await response.json();

        // Usar apenas o primeiro elemento do array, que contém os dados das cidades
        const stateData = stateDataArray[0];

        if (!stateData || !Array.isArray(stateData.cities)) {
          console.error("Dados inválidos recebidos:", stateData);
          return;
        }

        // Capturar os dados de SE (Semana Epidemiológica)
        const latestSE = stateData.cities[0]?.SE || "Desconhecido";

        // Atualizar o título do gráfico
        setChartTitle(
          `Casos de dengue referentes à semana ${latestSE.toString().slice(4)} e ano ${latestSE.toString().slice(0, 4)}`
        );

        // Ordenar as cidades pelos casos na última semana (descendente)
        const sortedCities = stateData.cities
          .sort((a: CityData, b: CityData) => b.casos - a.casos)
          .slice(0, 15); // Pegar apenas as 15 cidades com mais casos

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
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      }
    }

    fetchData();
  }, []);

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
      {/*<h2 className="text-xl font-bold text-center mb-4">{chartTitle}</h2> RESOLVER ISSO DEPOIS*/}
      <div className="barchart-wrapper">
      <Bar
        data={chartData}
        plugins={[ChartDataLabels]} // Aplica o plugin apenas a este gráfico
        options={{
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y", // Mantém gráfico vertical
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                font: { size: 14 },
              },
            },
            y: {
              min: -10,
              max: 10,
              display: false, // Remove os ticks do eixo Y (labels antigas)
            },
          },
          plugins: {
            legend: {
              display: false, // Remove a legenda (não é mais necessária)
            },
            datalabels: {
              // Configuração dos rótulos
              anchor: "start", // Posiciona o rótulo no início da barra
              align: "end", // Alinha o rótulo ao final da barra
              color: "black", // Cor do texto
              font: {
                size: 12,
                weight: "bold",
              },
              formatter: (value, context) => {
                // Exibe o nome da cidade e o número de casos
                return `${context.chart.data.labels[context.dataIndex]}: ${value}`;
              },
              offset: 10, // Ajusta a distância do rótulo em relação à barra
            },
          },
        }}
      />
      </div>
    </div>
  );
}