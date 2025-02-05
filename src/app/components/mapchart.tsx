"use client";

import React, { useEffect, useState } from "react";
import { Chart as ChartJS, Tooltip, Legend } from "chart.js";
import {
  ChoroplethController,
  ProjectionScale,
  ColorScale,
  GeoFeature,
} from "chartjs-chart-geo";
import { Chart } from "react-chartjs-2";

// Registrar os módulos necessários
ChartJS.register(
  ChoroplethController,
  ProjectionScale, // Registrar a escala de projeção
  ColorScale,
  GeoFeature,
  Tooltip,
  Legend
);

// Definindo tipos para os dados geoespaciais
interface GeoFeature {
  type: string;
  properties: { name: string };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoFeatureCollection {
  type: string;
  features: GeoFeature[];
}

const MapChart: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);

  // Carregar o GeoJSON de Minas Gerais
  useEffect(() => {
    fetch("/geojs-31-mun.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("GeoJSON carregado:", data); // Verifique os dados aqui
        setGeoData(data);
      })
      .catch((error) => console.error("Erro ao carregar o GeoJSON:", error));
  }, []);

  if (!geoData) {
    return <div>Carregando mapa...</div>;
  }

  // Dados fictícios (valores aleatórios para cada município)
  const data = {
    labels: geoData.features.map((feature) => feature.properties.name),
    datasets: [
      {
        label: "Municípios de Minas Gerais",
        data: geoData.features.map((feature) => ({
          feature,
          value: Math.random() * 100, // Valores aleatórios
        })),
        outline: geoData.features, // O Chart.js espera que outline seja um array
        backgroundColor: "rgba(30, 144, 255, 0.5)", // Azul claro
        borderColor: "rgba(0, 0, 139, 1)", // Azul escuro
        borderWidth: 1,
      },
    ],
  };

  // Configurações do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      projection: {
        axis: "x",
        projection: "mercator", // Usar Mercator
      },
    },
    plugins: {
      legend: {
        display: true, // Exibe a legenda
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const feature = context.raw.feature;
            return `${feature.properties.name}: ${context.raw.value.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "800px" }}>
      <Chart type="choropleth" data={data} options={options} />
    </div>
  );
};

export default MapChart;