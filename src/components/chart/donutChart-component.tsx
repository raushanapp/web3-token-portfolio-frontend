import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PortfolioAllocation {
  id: string;
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  holdings: number;
  current_price: number;
  color: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
    symbol: string;
    [key: string]: unknown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
}

interface PortfolioDonutChartProps {
  allocations: PortfolioAllocation[];
  isLoading?: boolean;
  totalValue?: number;
}

const DonutChartComponent: React.FC<PortfolioDonutChartProps> = ({ 
  allocations, 
  isLoading = false,
  totalValue = 0 
}) => {
  
  // Transform allocation data for chart
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!allocations || allocations.length === 0) return [];
    
    return allocations
      .filter(allocation => allocation.value > 0)
      .map(allocation => ({
        name: `${allocation.name} (${allocation.symbol})`,
        symbol: allocation.symbol,
        value: allocation.value,
        percentage: allocation.percentage,
        color: allocation.color,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [allocations]);

  // Custom tooltip component
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="p-3 rounded-lg shadow-lg border backdrop-blur-sm" 
          style={{ 
            backgroundColor: 'var(--color-background-elevated)',
            borderColor: 'var(--color-border-primary)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
          }}
        >
          <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {data.symbol}
          </p>
          <p className="font-semibold" style={{ color: 'var(--color-success-500)' }}>
            {formatCurrency(data.value)}
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {formatPercentage(data.percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="p-6 rounded-xl"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-primary)'
        }}
      >
        <h3 className="text-sm font-medium uppercase tracking-wide mb-4" 
            style={{ color: 'var(--color-text-secondary)' }}>
          Portfolio Total
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2" 
               style={{ borderColor: 'var(--color-success-500)' }}></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <div 
        className="p-6 rounded-xl"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-primary)'
        }}
      >
        <h3 className="text-sm font-medium uppercase tracking-wide mb-4" 
            style={{ color: 'var(--color-text-secondary)' }}>
          Portfolio Total
        </h3>
        <div className="flex items-center justify-center h-64" 
             style={{ color: 'var(--color-text-secondary)' }}>
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">Add tokens with holdings to see allocation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-xl"
      style={{ 
        backgroundColor: 'var(--color-background-secondary)',
        border: '1px solid var(--color-border-primary)'
      }}
    >
      {/* Header with total value */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium uppercase tracking-wide" 
            style={{ color: 'var(--color-text-secondary)' }}>
          Portfolio Total
        </h3>
        {totalValue > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Chart Section */}
        <div className="flex-shrink-0">
          <ResponsiveContainer width={240} height={240}>
            <PieChart>
              <Pie
                data={chartData??[]}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Section */}
        <div className="flex-1 space-y-2">
          {chartData.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{ 
                backgroundColor: 'var(--color-background-tertiary)',
                border: '1px solid var(--color-border-primary)'
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: `0 0 8px ${item.color}40`
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" 
                       style={{ color: 'var(--color-text-primary)' }}>
                    {item.symbol}
                  </div>
                  <div className="text-xs" 
                       style={{ color: 'var(--color-text-secondary)' }}>
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold" 
                     style={{ color: 'var(--color-text-primary)' }}>
                  {formatPercentage(item.percentage)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default DonutChartComponent;