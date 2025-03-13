"use client";

import React, { useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

export interface LayerOption {
  type: 'casos' | 'nivel' | 'incidencia';
  label: string;
  tooltip: string;
}

interface LayerSelectorProps {
  options: LayerOption[];
  onLayerChange: (type: 'casos' | 'nivel' | 'incidencia') => void;
}

const LayerSelector: React.FC<LayerSelectorProps> = ({ options, onLayerChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(options[0].type);

  const handleSelect = (type: 'casos' | 'nivel' | 'incidencia') => {
    setSelectedLayer(type);
    onLayerChange(type);
    setIsOpen(false);
  };

  const currentOption = options.find(option => option.type === selectedLayer) || options[0];

  return (
    <div className="layer-selector-container">
      <button
        className={`layer-selector-button ${isOpen ? 'open' : ''}`} // Adiciona a classe 'open' quando o menu está aberto
        onClick={() => setIsOpen(!isOpen)}
        data-tooltip-id="layer-tooltip"
        data-tooltip-content={currentOption.tooltip}
      >
        <span>{currentOption.label}</span> {/* Separamos o texto da seta */}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <ul className="layer-selector-list">
          {options.map(option => (
            <li
              key={option.type}
              className={`layer-option ${selectedLayer === option.type ? 'selected' : ''}`}
              onClick={() => handleSelect(option.type)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      <ReactTooltip 
        id="layer-tooltip"
        className="tooltip-custom"
        place="left"
      />
    </div>
  );
};

export default LayerSelector;