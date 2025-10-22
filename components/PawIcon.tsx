import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface PawIconProps {
  size?: number;
  color?: string;
}

export const PawIcon: React.FC<PawIconProps> = ({ size = 24, color = '#000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Main paw pad */}
      <Path
        d="M12 18c-2.5 0-4.5-1.5-4.5-3.5s2-3.5 4.5-3.5 4.5 1.5 4.5 3.5-2 3.5-4.5 3.5z"
        fill={color}
      />
      {/* Top left toe */}
      <Circle cx="8" cy="8" r="1.5" fill={color} />
      {/* Top right toe */}
      <Circle cx="16" cy="8" r="1.5" fill={color} />
      {/* Middle left toe */}
      <Circle cx="6" cy="12" r="1.2" fill={color} />
      {/* Middle right toe */}
      <Circle cx="18" cy="12" r="1.2" fill={color} />
    </Svg>
  );
};