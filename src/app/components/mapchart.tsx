"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import Skeleton from "react-loading-skeleton";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import "leaflet/dist/leaflet.css";
import "react-loading-skeleton/dist/skeleton.css";
import { useDataStore } from "@/store/dataStore";
import L from "leaflet";
import { Feature, Geometry } from "geojson";
import LayerSelector from "./layerselector";
import ChartHeader from "./chartheader";
import { LayerOption } from "./layerselector";

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
  p_inc100k: number;
}

const MapChart: React.FC = () => {
  const { stateData, setSelectedCity, selectedCity } = useDataStore();
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [visualization, setVisualization] = useState<'casos' | 'nivel' | 'incidencia'>('casos');
  const [isColorblindMode, setIsColorblindMode] = useState(false);

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
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 8, duration: 1 });
          }
        }
      }
    }
  }, [selectedCity, geoData, stateData]);

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

  const getColorByCasos = (casos: number) => {
    if (casos >= 300) return "#bd0026"; // 300+
    if (casos >= 200) return "#f03b20"; // 200-300
    if (casos >= 100) return "#fd8d3c"; // 100-200
    if (casos >= 50) return "#feb24c"; // 50-100
    if (casos >= 10) return "#fed976"; // 10-50
    if (casos >= 0) return "#ffffb2"; // 0-10
    return "#C8C8C8"; // 0-10
  };

  const getColorByNivel = (nivel: number) => {
    switch (nivel) {
      case 1: return "#4daf4a";
      case 2: return "#ffff33";
      case 3: return "#ff7f00";
      case 4: return "#e41a1c";
      default: return "#C8C8C8";
    }
  };

  const getColorByNivelColorblind = (nivel: number) => {
    switch (nivel) {
      case 1: return "#0077bb"; // Azul escuro
      case 2: return "#33bbee"; // Azul médio
      case 3: return "#ee7733"; // Laranja claro
      case 4: return "#cc3311"; // Vermelho escuro
      default: return "#bbbbbb"; // Desconhecido
    }
  };

  const getColorByIncidencia = (incidencia: number) => {
    if (incidencia >= 300) return "#bd0026"; // Vinho
    if (incidencia >= 200) return "#f03b20"; // Vermelho
    if (incidencia >= 100) return "#fd8d3c"; // Laranja escuro
    if (incidencia >= 50) return "#feb24c"; // Laranja claro
    if (incidencia >= 10) return "#fed976"; // Amarelo escuro
    if (incidencia >= 0) return "#ffffb2"; // Amarelo claro
    return "#C8C8C8";
  };

  const citiesMap = new Map<number, CityData>();
  stateData[0].cities.forEach((city: CityData) => {
    citiesMap.set(city.geocode, city);
  });

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
    const isSelected = selectedCity === city?.city;
    const fillOpacity = selectedCity ? (isSelected ? 1 : 0.2) : 0.7;
    let fillColor;
    if (visualization === 'casos') {
      fillColor = getColorByCasos(city?.casos || 0);
    } else if (visualization === 'nivel') {
      fillColor = isColorblindMode
        ? getColorByNivelColorblind(city?.nivel || 0)
        : getColorByNivel(city?.nivel || 0);
    } else {
      fillColor = getColorByIncidencia(city?.p_inc100k || 0);
    }
    return {
      fillColor,
      weight: isSelected ? 1.5 : 0.5,
      opacity: 1,
      color: "#000",
      fillOpacity,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, GeoFeatureProperties>, layer: L.Layer) => {
    const city = citiesMap.get(Number(feature.properties.id));
    const levels: Record<number, string> = {
      1: "Baixa Transmissão",
      2: "Atenção",
      3: "Transmissão Ativa",
      4: "Alta Incidência"
    };
    if (city) {
      let tooltipContent;
        tooltipContent = `<strong>${feature.properties.name}</strong><br>Casos de dengue na última semana: ${city.casos}`;
        tooltipContent += `<br>Nível de Alerta: ${levels[city.nivel] || "Desconhecido"}`;
        tooltipContent += `<br>Incidência por 100 mil habitantes: ${city.p_inc100k.toFixed(2)}`;
      layer.bindTooltip(tooltipContent, { permanent: false, sticky: true });
      layer.on("click", () => {
        setSelectedCity(city.city);
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

  const layerOptions: LayerOption[] = [
    {
      type: 'casos',
      label: 'Casos',
      tooltip: 'Exibir mapa com base nos casos de dengue'
    },
    {
      type: 'nivel',
      label: 'Nível de Alerta',
      tooltip: 'Exibir mapa com base no nível de alerta'
    },
    {
      type: 'incidencia',
      label: 'Incidência por 100k',
      tooltip: 'Exibir mapa com base na incidência por 100 mil habitantes'
    }
  ];
  
  const handleLayerChange = (type: 'casos' | 'nivel' | 'incidencia') => {
    setVisualization(type);
  };

  return (
    <div className="map-container">
      <ChartHeader title="Mapa de Alertas de Dengue na Última Semana">
        {visualization === 'nivel' && (
          <button
            className={`colorblind-toggle ${isColorblindMode ? "active" : ""}`}
            onClick={() => setIsColorblindMode(!isColorblindMode)}
            data-tooltip-id="colorblind-tooltip"
            data-tooltip-content={isColorblindMode ? "Desativa o Modo Daltônico" : "Ativar Modo Daltônico"}
          >
            {isColorblindMode ? "Destivar Modo Daltônico" : "Ativar Modo Daltônico"}
          </button>
        )}
        <ReactTooltip
          id="colorblind-tooltip"
          className="tooltip-custom"
          place="bottom"
        />
        <LayerSelector
          options={layerOptions}
          onLayerChange={handleLayerChange}
        />
      </ChartHeader>
      <div className="map-outer">
        <button
          className="reset-button"
          onClick={handleResetToState}
          data-tooltip-id="reset-button-tooltip-id"
          data-tooltip-content="Voltar à visão estadual"
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
            className="tooltip-custom"
            place="bottom"
          />
        </button>
        {!mapReady}
        {mapReady && (
          <MapContainer
            center={[-18.5122, -44.555]}
            zoom={6}
            style={{ height: "100%", width: "100%", borderRadius: "5px", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Fonte: <a href="https://info.dengue.mat.br">info.dengue.mat.br</a>'
            />
            {stateData && (
              <GeoJSON
                key={`${visualization}-${selectedCity || 'none'}`}
                ref={geoJsonLayerRef}
                data={geoData as GeoJSON.FeatureCollection}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>
        )}
      </div>
      {visualization === 'casos' ? (
        <div className="legend">
          <h4>Intensidade de Casos</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color casos-300-plus" />
              <span>300+</span>
            </div>
            <div className="legend-item">
              <div className="legend-color casos-200-300" />
              <span>200-300</span>
            </div>
            <div className="legend-item">
              <div className="legend-color casos-100-200" />
              <span>100-200</span>
            </div>
            <div className="legend-item">
              <div className="legend-color casos-50-100" />
              <span>50-100</span>
            </div>
            <div className="legend-item">
              <div className="legend-color casos-10-50" />
              <span>10-50</span>
            </div>
            <div className="legend-item">
              <div className="legend-color casos-0-10" />
              <span>0-10</span>
            </div>
          </div>
        </div>
      ) : visualization === 'nivel' ? (
        <div className="legend">
          <h4>Nível de Alerta</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: isColorblindMode ? getColorByNivelColorblind(4) : getColorByNivel(4) }} />
              <span>Alta Incidência</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: isColorblindMode ? getColorByNivelColorblind(3) : getColorByNivel(3) }} />
              <span>Transmissão ativa</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: isColorblindMode ? getColorByNivelColorblind(2) : getColorByNivel(2) }} />
              <span>Atenção</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: isColorblindMode ? getColorByNivelColorblind(1) : getColorByNivel(1) }} />
              <span>Baixa Transmissão</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: isColorblindMode ? getColorByNivelColorblind(0) : getColorByNivel(0) }} />
              <span>Desconhecido</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="legend">
          <h4>Incidência por 100 mil habitantes</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color incidencia-300-plus" />
              <span>300+</span>
            </div>
            <div className="legend-item">
              <div className="legend-color incidencia-200-300" />
              <span>200-300</span>
            </div>
            <div className="legend-item">
              <div className="legend-color incidencia-100-200" />
              <span>100-200</span>
            </div>
            <div className="legend-item">
              <div className="legend-color incidencia-50-100" />
              <span>50-100</span>
            </div>
            <div className="legend-item">
              <div className="legend-color incidencia-10-50" />
              <span>10-50</span>
            </div>
            <div className="legend-item">
              <div className="legend-color incidencia-0-10" />
              <span>0-10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapChart;