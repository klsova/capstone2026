import React, { useState } from 'react';
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
} from 'recharts';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

// Mielivaltaista "testidataa"
const dailyData = [
  { time: 'Mon', cumulative: 100, limit: 150 },
  { time: 'Tue', cumulative: 250, limit: 300 },
  { time: 'Wed', cumulative: 380, limit: 450 },
  { time: 'Thu', cumulative: 420, limit: 600 },
  { time: 'Fri', cumulative: 510, limit: 750 },
];

const weeklyData = [
  { time: 'Week 1', cumulative: 510, limit: 750 },
  { time: 'Week 2', cumulative: 1720, limit: 1500 },
  { time: 'Week 3', cumulative: 2200, limit: 2250 },
];

const CumulativeChart = () => {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextView: 'daily' | 'weekly',
  ) => {
    if (nextView !== null) setView(nextView);
  };

  const data = view === 'daily' ? dailyData : weeklyData;

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Cumulative Sum
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="daily">Daily</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/*Maksimiraja*/}
            <Line
              type="monotone"
              dataKey="limit"
              stroke="#ff7300"
              dot={false}
              strokeDasharray="5 5"
              name="Max Limit"
            />

            {/*Toteutunut data*/}
            <Scatter dataKey="cumulative" fill="#60c9f8" name="Emission" />

            <Line
              type="stepAfter"
              dataKey="cumulative"
              stroke="#60c9f8"
              dot={true}
              name="Trend"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default CumulativeChart;
