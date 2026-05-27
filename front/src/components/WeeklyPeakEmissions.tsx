import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Line,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

interface WeeklyPeakEmissionsProps {
  savedPeaks: any[];
}

// MBQ constant divider, possibly put into env variable?
const MBQ_CONSTANT = 34.28;

const WeeklyPeakEmissions: React.FC<WeeklyPeakEmissionsProps> = ({ savedPeaks }) => {
  const weeklyData = useMemo(() => {
    const weeks = Array.from({ length: 53 }, (_, i) => ({
      week: `W${i + 1}`,
      area: 0,
    }));

    if (!savedPeaks || savedPeaks.length === 0) return weeks;

    savedPeaks.forEach((peak) => {
      const peakWeek = dayjs(peak.startTime).isoWeek();

      const targetWeek = weeks[peakWeek - 1];

      if (targetWeek && peak.area) {
        targetWeek.area += peak.area;
      }
    });

    return weeks.map((w) => ({
      ...w,
      area: Math.round(w.area * 100) / 100,
      areaMBq: Math.round((w.area / MBQ_CONSTANT) * 100) / 100,
    }));
  }, [savedPeaks]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            barCategoryGap="15%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="week" fontSize={11} tick={{ fill: '#666' }} interval={3} />
            <YAxis
              yAxisId="left"
              fontSize={11}
              tick={{ fill: '#666' }}
              label={{
                value: 'Counts',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#666', fontWeight: 'bold' },
              }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              fontSize={11}
              tick={{ fill: '#1976d2' }}
              tickFormatter={(val) => val.toFixed(1)}
              label={{
                value: 'MBq',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#1976d2', fontWeight: 'bold' },
              }}
            />

            <Tooltip
              cursor={{ fill: '#f5f5f5' }}
              formatter={(value: any, name: any) => {
                if (name === 'areaMBq') return [`${value} MBq`, 'Total Area (MBq)'];
                return [`${value} units`, 'Total Area (Counts)'];
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="area"
              fill="#60c9f8"
              radius={[4, 4, 0, 0]}
              name="area"
            >
              {weeklyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.area > 0 ? '#ff9800' : '#e0e0e0'}
                />
              ))}
            </Bar>

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="areaMBq"
              stroke="transparent"
              dot={false}
              activeDot={false}
              name="areaMBq"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default WeeklyPeakEmissions;
