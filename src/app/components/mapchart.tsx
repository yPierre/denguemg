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
  properties: { name: string; id: number }; // Alterado para "id"
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoFeatureCollection {
  type: string;
  features: GeoFeature[];
}

interface CityData {
  city: string;
  geocode: number;
  pop: number;
  data: {
    SE: number;
    casos_est: number;
    casos: number;
    nivel: number;
  }[];
}

const MapChart: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
  const [citiesData, setCitiesData] = useState<CityData[]>([]);

  // Carregar o GeoJSON de Minas Gerais
  useEffect(() => {
    fetch("/geojs-31-mun.json")
      .then((response) => response.json())
      .then((data) => {
        setGeoData(data);
      })
      .catch((error) => console.error("Erro ao carregar o GeoJSON:", error));
  }, []);

  // Carregar os dados das cidades do MongoDB
  useEffect(() => {
    fetch("/api/cities")
      .then((response) => response.json())
      .then((data) => {
        setCitiesData(data);
      })
      .catch((error) => console.error("Erro ao carregar dados das cidades:", error));
  }, []);

  if (!geoData || citiesData.length === 0) {
    return <div>Carregando mapa...</div>;
  }

  // Mapear os dados das cidades para o GeoJSON
  const getColorByNivel = (nivel: number) => {
    switch (nivel) {
      case 1:
        return "rgba(0, 255, 0, 0.5)"; // Verde
      case 2:
        return "rgba(255, 255, 0, 0.5)"; // Amarelo
      case 3:
        return "rgba(255, 165, 0, 0.5)"; // Laranja
      case 4:
        return "rgba(255, 0, 0, 0.5)"; // Vermelho
      default:
        return "rgba(200, 200, 200, 0.5)"; // Cinza (padrão)
    }
  };

  const data = {
    labels: geoData.features.map((feature) => feature.properties.name),
    datasets: [
      {
        label: "Municípios de Minas Gerais",
        data: geoData.features.map((feature) => {
          // Converter ambos os valores para números para garantir a correspondência
          const city = citiesData.find((c) => c.geocode === Number(feature.properties.id));

          const latestData = city ? city.data[0] : null; // Pega os dados da semana mais recente
          return {
            feature,
            value: latestData ? latestData.nivel : 0, // Usa o nível como valor
            casos: latestData ? latestData.casos : 0, // Número de casos para o tooltip
          };
        }),
        outline: geoData.features,
        backgroundColor: geoData.features.map((feature) => {
          const city = citiesData.find((c) => c.geocode === Number(feature.properties.id));
          const nivel = city ? city.data[0].nivel : 1; // Nível da semana mais recente
          return getColorByNivel(nivel);
        }),
        borderColor: "rgba(0, 0, 0, 1)", // Bordas pretas
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
            const city = citiesData.find((c) => c.geocode === Number(feature.properties.id));
            const latestData = city ? city.data[0] : null;
            return `${feature.properties.name}: ${latestData ? latestData.casos : 0} casos`;
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