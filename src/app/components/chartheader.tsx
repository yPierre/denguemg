// components/ChartHeader.tsx
"use client";

import React from 'react';

interface ChartHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, children  }) => {
  return (
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      {children && <div className="chart-controls">{children}</div>}
    </div>
  );
};

export default ChartHeader;