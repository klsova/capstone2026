import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  // Area,
} from 'recharts';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

interface CumulativeChartProps {
  savedPeaks: any[];
}
// TODO: possibly take the constant from env variable?
const MBQ_CONSTANT = 34.28;

// TODO: Change to actual weekly limit, this is approx taken from the report
const WEEKLY_LIMIT_MBQ = 10000;

const CumulativeChart: React.FC<CumulativeChartProps> = ({ savedPeaks }) => {
  const [view, setView] = useState<'daily' | 'weekly'>('weekly');

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextView: 'daily' | 'weekly',
  ) => {
    if (nextView !== null) setView(nextView);
  };

  const weeklyData = useMemo(() => {
    const weeks = Array.from({ length: 53 }, (_, i) => ({
      week: `W${i + 1}`,
      areaCounts: 0,
      cumulativeMBq: 0,
      limit: (i + 1) * WEEKLY_LIMIT_MBQ,
    }));

    if (!savedPeaks || savedPeaks.length === 0) return weeks;

    savedPeaks.forEach((peak) => {
      const peakWeek = dayjs(peak.startTime).isoWeek();
      const targetWeek = weeks[peakWeek - 1];

      if (targetWeek && peak.area) {
        targetWeek.areaCounts += peak.area;
      }
    });

    let runningSumMBq = 0;

    return weeks.map((w) => {
      const currentWeekMBq = w.areaCounts / MBQ_CONSTANT;
      runningSumMBq += currentWeekMBq;

      return {
        ...w,
        cumulativeMBq: Math.round(runningSumMBq * 100) / 100,
      };
    });
  }, [savedPeaks]);

  // TODO: daily data is placeholder for now
  const dailyData: any[] = [];
  const data = view === 'daily' ? dailyData : weeklyData;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: -10, right: 10, zIndex: 10 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{ height: 26 }}
        >
          <ToggleButton value="daily" disabled sx={{ fontSize: '0.7rem', py: 0 }}>
            Daily
          </ToggleButton>
          <ToggleButton value="weekly" sx={{ fontSize: '0.7rem', py: 0 }}>
            Weekly
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" fontSize={11} tick={{ fill: '#666' }} interval={3} />
            <YAxis fontSize={11} tick={{ fill: '#666' }} />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === 'limit') return [`${value} MBq`, 'Limit'];
                if (name === 'cumulativeMBq') return [`${value} MBq`, 'Cumulative'];
                return value;
              }}
            />

            <Line
              type="monotone"
              dataKey="limit"
              stroke="#ff7300"
              dot={false}
              strokeDasharray="5 5"
              name="limit"
            />

            {/*             <Scatter
              dataKey="cumulativeMBq"
              fill="#60c9f8"
              name="cumulativeMBq"
              legendType="none"
            /> */}

            <Line
              type="stepAfter"
              dataKey="cumulativeMBq"
              stroke="#60c9f8"
              strokeWidth={2}
              dot={false}
              name="cumulativeMBq"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default CumulativeChart;
