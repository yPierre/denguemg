"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import Skeleton from "react-loading-skeleton";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import "leaflet/dist/leaflet.css";
import "react-loading-skeleton/dist/skeleton.css"; // Importa o CSS padrão do skeleton
import { useDataStore } from "@/store/dataStore";
import L from "leaflet";
import { Feature, Geometry } from "geojson";

// Definindo tipos para os dados geoespaciais
interface GeoFeature {
  type: "Feature";
  properties: { name: string; id: number };
  geometry: {
    type: "Polygon" | "MultiPolygon";
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

const MapChart: React.FC = () => {
  const { stateData, setSelectedCity, selectedCity } = useDataStore();
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [maxCasos, setMaxCasos] = useState(0);

  // Função para dar zoom na cidade pesquisada
  useEffect(() => {
    if (selectedCity && geoJsonLayerRef.current && stateData) {
      const city = stateData[0].cities.find((c: CityData) => c.city === selectedCity);
      if (city) {
        const feature = geoData?.features.find(
          (f) => Number(f.properties.id) === city.geocode
        );
        if (feature && geoJsonLayerRef.current) {
          const layer = L.geoJSON(feature);
          const bounds = layer.getBounds();
          const map = mapRef.current;
          if (map) {
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 7, duration: 1 });
          }
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
        setMapReady(true);
      })
      .catch((error) => console.error("Erro ao carregar o GeoJSON:", error));
  }, []);

  useEffect(() => {
    if (stateData && stateData[0]?.cities) {
      const casos = stateData[0].cities.map((c: CityData) => c.casos);
      const currentMax = Math.max(...casos);
      setMaxCasos(currentMax);
    }
  }, [stateData]);

  // Limpeza ao desmontar o componente
  useEffect(() => {
    return () => {
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.clearLayers();
        geoJsonLayerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Renderiza o skeleton enquanto geoData ou stateData não estão prontos
  if (!geoData || !stateData) {
    return (
      <div className="map-container">
        <h3 className="component-title">
          <Skeleton width={300} height={24} />
        </h3>
        <div className="map-outer">
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  // Função para definir as cores com base no nível de alerta
  const getColorByCasos = (casos: number) => {
    if (maxCasos === 0) return '#FFEBEE'; // Vermelho claro padrão
    const ratio = casos / maxCasos;
    // Interpola entre vermelho claro (#FFEBEE) e escuro (#B71C1C)
    const red = Math.floor(255 - (255 - 183) * ratio);
    const green = Math.floor(235 - (235 - 28) * ratio);
    const blue = Math.floor(238 - (238 - 28) * ratio);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  // Mapear os dados das cidades para o GeoJSON
  const citiesMap = new Map<number, CityData>();
  stateData[0].cities.forEach((city: CityData) => {
    citiesMap.set(city.geocode, city);
  });

  // Estilo dos municípios
  const styleFeature = (feature: Feature<Geometry, GeoFeatureProperties> | undefined) => {
    if (!feature) {
      return {
        fillColor: "#C8C8C8",
        weight: 1,
        opacity: 1,
        color: "#000",
        fillOpacity: 0.8,
      };
    }
    const city = citiesMap.get(Number(feature.properties.id));
    //const nivel = city ? city.nivel : 1;
    const isSelected = selectedCity === city?.city;
    const fillOpacity = selectedCity ? (isSelected ? 1 : 0.5) : 0.7;
    return {
        fillColor: getColorByCasos(city?.casos || 0),
      weight: isSelected ? 1 : 0.5,
      opacity: 1,
      color: "#000",
      fillOpacity,
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
        setSelectedCity(city.city);
        layer.off("add");
        layer.once("add", (event) => {
          const map = event.target._map;
          const bounds = (layer as L.Polygon).getBounds();
          map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 9, duration: 1 });
        });
      });
    }
  };

  const handleResetToState = () => {
    setSelectedCity(null);
    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo([-18.5122, -44.555], 6, { duration: 1 });
    }
  };

  return (
    <div className="map-container">
      <h3 className="component-title">Mapa de Alertas de Dengue na Última Semana</h3>
      <div className="map-outer">
        <button
          className="reset-button"
          onClick={handleResetToState}
          data-tooltip-id="reset-button-tooltip-id"
          data-tooltip-content="Resetar para visão do estado"
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
          <ReactTooltip 
            id="reset-button-tooltip-id"
            className="reset-button-tooltip"
            place="bottom"
          />
        </button>
        {!mapReady && <div>Carregando mapa...</div>}
        {mapReady && (
          <MapContainer
            center={[-18.5122, -44.555]}
            zoom={6}
            style={{ height: "100%", width: "100%", borderRadius: "5px", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {stateData && (
              <GeoJSON
                ref={geoJsonLayerRef}
                data={geoData as GeoJSON.FeatureCollection}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>
        )}
      </div>
      <div className="legend">
      <h4>Intensidade de Casos</h4>
        <div className="legend-gradient" style={{
            background: "linear-gradient(to right, #FFEBEE, #B71C1C)",
            height: "20px",
            borderRadius: "4px"
        }}/>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>0</span>
            <span>{maxCasos}</span>
        </div>
      </div>
    </div>
  );
};

export default MapChart;