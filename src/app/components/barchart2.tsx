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
import ChartHeader from "./chartheader";
import { useDataStore } from "@/store/dataStore";
import Skeleton from "react-loading-skeleton"; // Importa o componente Skeleton
import "react-loading-skeleton/dist/skeleton.css"; // Importa o CSS padrão

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface CityData {
  city: string;
  geocode: number;
  casos: number;
  nivel: number;
}

export default function BarChart2() {
  const { stateData } = useDataStore(); // Pega os dados do estado global
  const currentStateData = stateData?.[0] || null;

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

    // Ordena cidades por número de casos e pega as 15 com mais casos
    const sortedCities = currentStateData.cities
      .sort((a: CityData, b: CityData) => b.casos - a.casos)
      .slice(0, 15);

    const labels = sortedCities.map((city: CityData) => city.city);
    const casos = sortedCities.map((city: CityData) => city.casos);
    const backgroundColors = sortedCities.map((city: CityData) => getAlertColor(city.nivel));

    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Casos na Última Semana",
          data: casos,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color: string) => color.replace("0.6", "1")),
          borderWidth: 1,
        },
      ],
    });
  }, [currentStateData]); // Atualiza o gráfico sempre que `currentStateData` mudar

  // Função para definir cores com base no nível de alerta
  const getAlertColor = (nivel: number) => {
    switch (nivel) {
      case 1:
        return "#4CAF50"; // Verde (baixo risco)
      case 2:
        return "#FFC107"; // Amarelo (médio risco)
      case 3:
        return "#FF9800"; // Laranja (alto risco)
      case 4:
        return "#E53935"; // Vermelho (alerta máximo)
      default:
        return "rgba(200, 200, 200, 0.6)"; // Cinza (desconhecido)
    }
  };

  // Renderiza o skeleton enquanto os dados não estão disponíveis
  if (!stateData) {
    return (
      <div className="barchart-component">
        <h3 className="component-title">
          <Skeleton/>
        </h3>
        <div className="barchart-container">
          <div className="barchart-wrapper">
            <Skeleton/>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza o gráfico quando os dados estão prontos
  return (
    <div className="barchart-component">
      <ChartHeader
        title="Cidades"
        toggleOptions={[
          {
            type: 'absolute',
            label: 'Absoluto',
            tooltip: 'Mostra o número total de casos reportados'
          },
          {
            type: 'per100k',
            label: 'Por 100k',
            tooltip: 'Mostra casos proporcionalmente à população'
          }
        ]}
      />
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
                  title: { display: true, text: "Casos por cidade" },
                  beginAtZero: true,
                  ticks: {
                    font: { size: 12 },
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
                    const labels = context.chart.data.labels as string[] | undefined;
                    return labels ? `${labels[context.dataIndex]}: ${value}` : `${value}`;
                  },
                  offset: 10,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}