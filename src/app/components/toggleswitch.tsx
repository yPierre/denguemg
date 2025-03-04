"use client";

import React, { useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface ToggleSwitchProps {
  options: {
    type: 'absolute' | 'per100k' | 'weekly' | 'accumulated';
    label: string;
    tooltip: string;
  }[];
  onToggleChange: (type: 'absolute' | 'per100k' | 'weekly' | 'accumulated') => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ options, onToggleChange }) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    const newState = !isToggled;
    setIsToggled(newState);
    onToggleChange(options[newState ? 1 : 0].type);
  };

  const currentOption = options[isToggled ? 1 : 0];

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