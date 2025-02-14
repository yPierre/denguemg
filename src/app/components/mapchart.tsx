"use client";

import React, { useEffect, useState } from "react";
import { Chart as ChartJS, Tooltip, TooltipItem, ChartOptions, Legend } from "chart.js";
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
  casos: number;
  nivel: number;
}

interface StateData {
  total_week_cases: number;
  total_pop: number;
  cities_in_alert_state: number;
  cities: CityData[];
}

const MapChart: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
  const [stateData, setStateData] = useState<StateData | null>(null);

  // Carregar o GeoJSON de Minas Gerais
  useEffect(() => {
    fetch("/geojs-31-mun.json")
      .then((response) => response.json())
      .then((data) => {
        setGeoData(data);
      })
      .catch((error) => console.error("Erro ao carregar o GeoJSON:", error));
  }, []);

  // Carregar os dados do estado (última semana) do MongoDB
  useEffect(() => {
    fetch("/api/state")
      .then((response) => response.json())
      .then((data) => {
        // Usar apenas o primeiro elemento do array, que contém os dados das cidades
        if (Array.isArray(data) && data.length > 0) {
          setStateData(data[0]);
        } else {
          console.error("Dados inválidos ou vazios:", data);
        }
      })
      .catch((error) => console.error("Erro ao carregar dados do estado:", error));
  }, []);

  if (!geoData || !stateData) {
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

  const legendItems = [
    { label: "Baixo", color: "rgba(0, 255, 0, 0.5)" },
    { label: "Médio", color: "rgba(255, 255, 0, 0.5)" },
    { label: "Alto", color: "rgba(255, 165, 0, 0.5)" },
    { label: "Crítico", color: "rgba(255, 0, 0, 0.5)" },
  ];

  // Criar um Map para busca eficiente
  const citiesMap = new Map<number, CityData>();
  stateData.cities.forEach((city) => {
    citiesMap.set(city.geocode, city);
  });

  const data = {
    labels: geoData.features.map((feature) => feature.properties.name),
    datasets: [
      {
        label: "Municípios de Minas Gerais",
        data: geoData.features.map((feature) => {
          const city = citiesMap.get(Number(feature.properties.id));
          return {
            feature,
            value: city ? city.nivel : 0, // Usa o nível como valor
            casos: city ? city.casos : 0, // Número de casos para o tooltip
          };
        }),
        outline: geoData.features,
        backgroundColor: geoData.features.map((feature) => {
          const city = citiesMap.get(Number(feature.properties.id));
          const nivel = city ? city.nivel : 1; // Nível da semana mais recente
          return getColorByNivel(nivel);
        }),
        borderColor: "rgba(0, 0, 0, 1)", // Bordas pretas
        borderWidth: 1,
      },
    ],
  };

  // Configurações do gráfico
  const options: ChartOptions<"choropleth"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    projection: {
      axis: "x",
      type: "projection",
      projection: "mercator", // Usar Mercator
    },
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        generateLabels: (chart) => {
          return legendItems.map((item) => ({
            text: item.label,
            fillStyle: item.color,
            strokeStyle: item.color,
            lineWidth: 1,
          }));
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"choropleth">) => {
          const feature = (context.raw as { feature: GeoFeature }).feature;
          const city = citiesMap.get(Number(feature.properties.id));
          return `${feature.properties.name}: ${city ? city.casos : 0} casos`;
        },
      },
    },
  },
};

  return (
    <div className="map-container">
      <Chart type="choropleth" data={data} options={options} />
    </div>
  );
};

export default MapChart;