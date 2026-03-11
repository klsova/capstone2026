import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  AreaChart,
  Area,
} from 'recharts';
import { Box, Typography } from '@mui/material';

// Mielivaltaista testidataa
const generateData = () => {
  const data = [];
  for (let i = 0; i < 53; i++) {
    data.push({
      time: i,
      //Satunnaisia piikkejä
      value: Math.floor(Math.random() * 400) + (i % 10 === 0 ? 300 : 0),
    });
  }
  return data;
};

const data = generateData();

const PeakDetectionChart = () => {
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Peak Detection
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        1.1.2025 - 1.1.2026 --demo--
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#4caf50"
              fill="#e8f5e9"
              strokeWidth={2}
            />

            <Brush
              dataKey="time"
              height={30}
              stroke="#60c9f8"
              fill="fff"
              // Oletusikkuna
              // startIndex={10}
              // endIndex={40}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default PeakDetectionChart;
