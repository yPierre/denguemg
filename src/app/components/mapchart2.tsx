"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDataStore } from "@/store/dataStore"; // Importa o estado global

// Definindo tipos para os dados geoespaciais
interface GeoFeature {
  type: string;
  properties: { name: string; id: number };
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

const MapChart2: React.FC = () => {
  const { stateData } = useDataStore(); // Pega os dados do estado global
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null); // Estado para a cidade selecionada

  // Carregar o GeoJSON de Minas Gerais
  useEffect(() => {
    fetch("/geojs-31-mun.json")
      .then((response) => response.json())
      .then((data) => {
        setGeoData(data);
      })
      .catch((error) => console.error("Erro ao carregar o GeoJSON:", error));
  }, []);

  if (!geoData || !stateData) {
    return <div>Carregando mapa...</div>;
  }

  // Função para definir as cores com base no nível de alerta
  const getColorByNivel = (nivel: number) => {
    switch (nivel) {
      case 1:
        return "#00FF00FF"; // Verde
      case 2:
        return "#FFFF00"; // Amarelo
      case 3:
        return "#FFA500"; // Laranja
      case 4:
        return "#FF0000"; // Vermelho
      default:
        return "#C8C8C8"; // Cinza (padrão)
    }
  };

  // Mapear os dados das cidades para o GeoJSON
  const citiesMap = new Map<number, CityData>();
  stateData[0].cities.forEach((city) => {
    citiesMap.set(city.geocode, city);
  });

  // Estilo dos municípios
  const styleFeature = (feature: GeoFeature) => {
    const city = citiesMap.get(Number(feature.properties.id));
    const nivel = city ? city.nivel : 1;
    return {
      fillColor: getColorByNivel(nivel),
      weight: 1,
      opacity: 1,
      color: "#000",
      fillOpacity: 0.5,
    };
  };

  // Tooltip e evento de clique para cada município
  const onEachFeature = (feature: GeoFeature, layer: L.Layer) => {
    const city = citiesMap.get(Number(feature.properties.id));

    if (city) {
      // Tooltip
      layer.bindTooltip(
        `<strong>${feature.properties.name}</strong><br>Casos: ${city.casos}`,
        { permanent: false, sticky: true }
      );

      // Evento de clique
      layer.on("click", () => {
        setSelectedCity(city); // Armazena a cidade selecionada
        const map = layer._map; // Acessa o mapa
        const bounds = layer.getBounds(); // Obtém os limites da cidade
        map.flyToBounds(bounds, { padding: [5, 5], maxZoom: 7 }); // Dá zoom na cidade
      });
    }
  };

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={[-18.5122, -44.555]} // Centro de Minas Gerais
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stateData && (
          <GeoJSON
            data={geoData} // Certifique-se de que geoData está no stateData
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Exibe a cidade selecionada (para teste) */}
      {selectedCity && (
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <strong>Cidade selecionada:</strong> {selectedCity.city} (Casos: {selectedCity.casos})
        </div>
      )}
    </div>
  );
};

export default MapChart2;