// components/ChartHeader.tsx
"use client";

import React from 'react';
import ToggleSwitch from './toggleswitch';

interface ChartHeaderProps {
  title: string;
  toggleOptions: {
    type: 'absolute' | 'per100k' | 'weekly' | 'accumulated';
    label: string;
    tooltip: string;
  }[];
  onToggleChange: (type: 'absolute' | 'per100k' | 'weekly' | 'accumulated') => void; 
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, toggleOptions, onToggleChange  }) => {
  return (
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-controls">
      <ToggleSwitch options={toggleOptions} onToggleChange={onToggleChange} />
      </div>
    </div>
  );
};

export default ChartHeader;