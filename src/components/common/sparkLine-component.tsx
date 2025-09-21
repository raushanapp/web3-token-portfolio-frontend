import React from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  className?: string;
}

const SparklineComponent: React.FC<SparklineProps> = ({ data, color, className = '' }) => {
  if (!data || data.length === 0) {
    return <div className={`bg-gray-100 rounded ${className}`}></div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  if (range === 0) {
    return <div className={`bg-gray-100 rounded ${className}`}></div>;
  }

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
export default SparklineComponent