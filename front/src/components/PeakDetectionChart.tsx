import { useEffect, useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  AreaChart,
  Area,
} from 'recharts';
import { Box, Typography, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';

interface PeakDetectionChartProps {
  facility: string;
  startDate: string;
  endDate: string;
}

interface DataPoint {
  timestamp: string;
  counts: number;
}

// Mielivaltaista testidataa
/* const generateData = () => {
  const data = [];
  for (let i = 0; i < 53; i++) {
    data.push({
      time: i,
      //Satunnaisia piikkejä
      value: Math.floor(Math.random() * 400) + (i % 10 === 0 ? 300 : 0),
    });
  }
  return data;
}; */

// const data = generateData();

const PeakDetectionChart: React.FC<PeakDetectionChartProps> = ({
  facility,
  startDate,
  endDate,
}) => {
  console.log(startDate, endDate);

  const [rawData, setRawData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch demo JSON data from file, to be replaced with fetching from backend:
  useEffect(() => {
    setLoading(true);
    fetch('/demo_resample.json')
      .then((res) => {
        if (!res.ok) throw new Error('File not found');
        return res.json();
      })
      .then((data) => {
        setRawData(data);
        setLoading(false);
      });
  }, []);

  // Filter by user given timespan
  const filteredData = useMemo(() => {
    if (rawData.length === 0) return [];

    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).endOf('day');

    return (
      rawData
        .filter((point) => {
          const pointDate = dayjs(point.timestamp);
          return (
            (pointDate.isAfter(start) || pointDate.isSame(start)) &&
            (pointDate.isBefore(end) || pointDate.isSame(end))
          );
        })
        //Formatting into more readable date/time
        .map((point) => ({
          ...point,
          displayTime: dayjs(point.timestamp).format('DD.MM. HH:mm'),
          counts: Math.round(point.counts * 100) / 100,
        }))
    );
  }, [rawData, startDate, endDate]);

  if (loading) {
    // reformat to universal spinner?
    return (
      <Box
        sx={{
          display: 'flex',
          height: 300,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography color="text.secondary">Loading data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error trying to load data: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Peak Detection: {facility}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        1.1.2025 - 1.1.2026 --demo--
      </Typography>
*/}
      {filteredData.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fafafa',
            borderRadius: 1,
          }}
        >
          <Typography color="text.disabled">
            No data found in the given timeframe.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="displayTime"
                fontSize={10}
                minTickGap={50}
                tick={{ fill: '#666' }}
              />
              <YAxis fontSize={10} tick={{ fill: '#666' }} />
              <Tooltip />

              <Area
                type="monotone"
                dataKey="counts"
                stroke="#4caf50"
                fill="#e8f5e9"
                strokeWidth={2}
                name="Counts"
              />

              <Brush
                dataKey="displayTime"
                height={30}
                stroke="#60c9f8"
                fill="fff"
                travellerWidth={10}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default PeakDetectionChart;
