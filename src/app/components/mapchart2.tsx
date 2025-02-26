"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDataStore } from "@/store/dataStore"; // Importa o estado global
import L from "leaflet";
import { Feature, Geometry } from "geojson";

// Definindo tipos para os dados geoespaciais
interface GeoFeature {
  type: "Feature"; // Defina o tipo como "Feature"
  properties: { name: string; id: number };
  geometry: {
    type: "Polygon" | "MultiPolygon"; // Defina os tipos de geometria suportados
    coordinates: number[][][];
  };
}

interface GeoFeatureCollection {
  type: string;
  features: GeoFeature[];
}

interface GeoFeatureProperties {
  name: string;
  id: number;
}

interface CityData {
  city: string;
  geocode: number;
  casos: number;
  nivel: number;
}



const MapChart2: React.FC = () => {
  const { stateData, setSelectedCity, selectedCity } = useDataStore(); // Pega os dados do estado global
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null); // Referência para a camada GeoJSON
  const mapRef = useRef<L.Map | null>(null);

  // Função para dar zoom na cidade pesquisada
  useEffect(() => {
    if (selectedCity && geoJsonLayerRef.current && stateData) {
      // Encontra a cidade no stateData
      const city = stateData[0].cities.find((c: CityData) => c.city === selectedCity);
      if (city) {
        // Encontra o feature correspondente no GeoJSON
        const feature = geoData?.features.find(
          (f) => Number(f.properties.id) === city.geocode
        );

        if (feature && geoJsonLayerRef.current) {
          // Cria uma camada temporária para o feature
          const layer = L.geoJSON(feature);
          const bounds = layer.getBounds();

          // Centraliza e dá zoom no mapa
          const map = mapRef.current;
          if(map)
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 7, duration: 1 });
        }
      }
    }
  }, [selectedCity, geoData, stateData]);

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
        return "#4CAF50"; // Verde (baixo risco)
      case 2:
        return "#FFC107"; // Amarelo (médio risco)
      case 3:
        return "#FF9800"; // Laranja (alto risco)
      case 4:
        return "#E53935"; // Vermelho (alerta máximo)
      default:
        return "#C8C8C8"; // Cinza (padrão)
    }
  };

  // Mapear os dados das cidades para o GeoJSON
  const citiesMap = new Map<number, CityData>();
  stateData[0].cities.forEach((city: CityData) => {
    citiesMap.set(city.geocode, city);
  });

  // Estilo dos municípios
  const styleFeature = (feature: Feature<Geometry, GeoFeatureProperties> | undefined) => {
    // Se o feature for undefined, retorne um estilo padrão
    if (!feature) {
      return {
        fillColor: "#C8C8C8", // Cinza (padrão)
        weight: 1,
        opacity: 1,
        color: "#000",
        fillOpacity: 0.5,
      };
    }
    const city = citiesMap.get(Number(feature.properties.id));
    const nivel = city ? city.nivel : 1;
    return {
      fillColor: getColorByNivel(nivel),
      weight: 0.5,
      opacity: 1,
      color: "#000",
      fillOpacity: 0.7,
    };
  };

  // Tooltip e evento de clique para cada município
  const onEachFeature = (feature: Feature<Geometry, GeoFeatureProperties>, layer: L.Layer) => {
    const city = citiesMap.get(Number(feature.properties.id));

    if (city) {
      layer.bindTooltip(
        `<strong>${feature.properties.name}</strong><br>Casos: ${city.casos}`,
        { permanent: false, sticky: true }
      );

      layer.on("click", () => {
        setSelectedCity(city.city); // Atualiza a cidade selecionada
        
        layer.on("add", (event) => {
          const map = event.target._map; // Agora _map é acessível via evento
          const bounds = (layer as L.Polygon).getBounds(); // Cast para L.Polygon (ou o tipo correto)
          map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 7, duration: 1 });
        });
      });
    }
  };


  const handleResetToState = () => {
    setSelectedCity(null); // Redefine a cidade selecionada
    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo([-18.5122, -44.555], 6, { duration: 1 }); // Volta ao zoom inicial
    }
  };

  

  return (
    <>
      <h3 className="component-title">Mapa de Alertas de Dengue</h3>
      <div style={{ height: "600px", width: "100%", position: "relative"}}>
        <button className="reset-button"
        onClick={handleResetToState}
        style={{
          position: "absolute",
          zIndex: 1000,
          backgroundColor: "#fff",
          cursor: "pointer",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
        <MapContainer
          center={[-18.5122, -44.555]} // Centro de Minas Gerais
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {stateData && (
            <GeoJSON
              ref={geoJsonLayerRef} // Referência para a camada GeoJSON
              data={geoData as GeoJSON.FeatureCollection}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
    </>
  );
};

export default MapChart2;