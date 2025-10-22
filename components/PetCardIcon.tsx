import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PetCardIconProps {
  size?: number;
  color?: string;
  variant?: 'default' | 'filled';
}

export const PetCardIcon: React.FC<PetCardIconProps> = ({ 
  size = 24, 
  color = '#000',
  variant = 'default'
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Large animal paw print - bigger and more prominent */}
      <g>
        {/* Main paw pad - larger heart-shaped pad */}
        <Path
          d="M12 20c3.5 0 6-2 6-4.5c0-1.5-1-2.8-2.5-3.5c0.3-0.5 0.5-1 0.5-1.6c0-1.4-1.1-2.5-2.5-2.5s-2.5 1.1-2.5 2.5c0 0.6 0.2 1.1 0.5 1.6c-1.5 0.7-2.5 2-2.5 3.5c0 2.5 2.5 4.5 6 4.5z"
          fill={color}
          strokeWidth="0"
        />
        
        {/* Left toe pad - larger */}
        <Path
          d="M7.5 11c0 1.1 0.7 2 1.6 2s1.6-0.9 1.6-2s-0.7-2-1.6-2s-1.6 0.9-1.6 2z"
          fill={color}
          strokeWidth="0"
        />
        
        {/* Center toe pad - larger */}
        <Path
          d="M10.4 8.5c0 1.1 0.7 2 1.6 2s1.6-0.9 1.6-2s-0.7-2-1.6-2s-1.6 0.9-1.6 2z"
          fill={color}
          strokeWidth="0"
        />
        
        {/* Right toe pad - larger */}
        <Path
          d="M13.3 11c0 1.1 0.7 2 1.6 2s1.6-0.9 1.6-2s-0.7-2-1.6-2s-1.6 0.9-1.6 2z"
          fill={color}
          strokeWidth="0"
        />
        
        {/* Additional small paw detail for more animal-like appearance */}
        <Path
          d="M12 4c0 0.8 0.4 1.5 1 1.5s1-0.7 1-1.5s-0.4-1.5-1-1.5s-1 0.7-1 1.5z"
          fill={color}
          strokeWidth="0"
        />
      </g>
    </Svg>
  );
};