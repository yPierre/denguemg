// components/ToggleSwitch.tsx
"use client";

import React, { useState } from 'react';
import { useDataStore } from '@/store/dataStore';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface ToggleSwitchProps {
  options: {
    type: 'absolute' | 'per100k' | 'weekly' | 'accumulated';
    label: string;
    tooltip: string;
  }[];
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ options }) => {
  const { dataType, setDataType } = useDataStore();
  const [isToggled, setIsToggled] = useState(false);
  const currentOption = options[isToggled ? 1 : 0];

  const handleToggle = () => {
    setIsToggled(!isToggled);
    setDataType(currentOption.type);
  };

  return (
    <div className="toggle-switch-container">
      <button
        className={`toggle-button ${isToggled ? 'toggled' : ''}`}
        onClick={handleToggle}
        data-tooltip-id="toggle-tooltip"
        data-tooltip-content={currentOption.tooltip}
      >
        <span className="toggle-label">{currentOption.label}</span>
        <span className="toggle-chevron">{isToggled ? '◀' : '▶'}</span>
      </button>
      <ReactTooltip 
        id="toggle-tooltip"
        className="tooltip-custom"
        place="bottom"
      />
    </div>
  );
};

export default ToggleSwitch;