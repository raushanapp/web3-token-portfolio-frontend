export interface ChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: unknown; // ✅ Allows Recharts to add internal properties
}

export interface TooltipData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TooltipData;
  }>;
}