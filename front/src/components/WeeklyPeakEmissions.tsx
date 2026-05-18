import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
    }));
  }, [savedPeaks]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/*       <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Annual Emission Areas by Week
      </Typography> */}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="week" fontSize={11} tick={{ fill: '#666' }} interval={3} />
            <YAxis fontSize={11} tick={{ fill: '#666' }} />

            <Tooltip
              cursor={{ fill: '#f5f5f5' }}
              formatter={(value: any) => [`${value} units`, 'Total Area']}
            />

            <Bar dataKey="area" fill="#60c9f8" radius={[4, 4, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.area > 0 ? '#ff9800' : '#e0e0e0'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default WeeklyPeakEmissions;
