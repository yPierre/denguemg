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
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, toggleOptions }) => {
  return (
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-controls">
        <ToggleSwitch options={toggleOptions} />
      </div>
    </div>
  );
};

export default ChartHeader;