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
  ReferenceArea,
} from 'recharts';
import {
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
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

// Demoa varten tehty päästöpiikkiolio
interface EmissionPeak {
  id: string;
  startTime: string;
  endTime: string;
  severity: string;
}

// 1. MOCK DATA DEMOA VARTEN (4.4.2025 - 5.5.2025)
const MOCK_PEAKS: EmissionPeak[] = [
  {
    id: 'DEMO-PEAK-001',
    startTime: '2025-04-10T12:35:00.000',
    endTime: '2025-04-10T14:00:00.000',
    severity: 'High',
  },
  {
    id: 'DEMO-PEAK-002',
    startTime: '2025-04-11T08:15:00.000',
    endTime: '2025-04-11T08:50:00.000',
    severity: 'Medium',
  },
];

const PeakDetectionChart: React.FC<PeakDetectionChartProps> = ({
  facility,
  startDate,
  endDate,
}) => {
  const [rawData, setRawData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // tila modalille
  const [selectedPeak, setSelectedPeak] = useState<EmissionPeak | null>(null);

  // Fetch demo JSON data from file
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fileName = `/${facility}_resample.json`;

    fetch(fileName)
      .then((res) => {
        if (!res.ok) throw new Error(`File not found: ${fileName}`);
        return res.json();
      })
      .then((data: DataPoint[]) => {
        setRawData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [facility]);

  // Filter by user given timespan
  const filteredData = useMemo(() => {
    if (rawData.length === 0) return [];

    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).endOf('day');

    return rawData
      .filter((point) => {
        const pointDate = dayjs(point.timestamp);
        return (
          (pointDate.isAfter(start) || pointDate.isSame(start)) &&
          (pointDate.isBefore(end) || pointDate.isSame(end))
        );
      })
      .map((point) => ({
        ...point,
        displayTime: dayjs(point.timestamp).format('DD.MM. HH:mm'),
        counts: Math.round(point.counts * 100) / 100,
      }));
  }, [rawData, startDate, endDate]);

  // DEMOPIIKKIEN FORMATOINTIA X-AKSELIA VARTEN
  const formattedPeaks = useMemo(() => {
    return MOCK_PEAKS.map((peak) => ({
      ...peak,
      displayStart: dayjs(peak.startTime).format('DD.MM. HH:mm'),
      displayEnd: dayjs(peak.endTime).format('DD.MM. HH:mm'),
    }));
  }, []);

  const handlePeakClick = (peak: EmissionPeak) => setSelectedPeak(peak);
  const handleCloseModal = () => setSelectedPeak(null);

  if (loading) {
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
                isAnimationActive={false}
              />

              {/* DEMO PEAKS ADDED TO CHART */}
              {formattedPeaks.map((peak, index) => (
                <ReferenceArea
                  key={index}
                  x1={peak.displayStart}
                  x2={peak.displayEnd}
                  fill={peak.severity === 'High' ? '#f44336' : '#ff9800'}
                  fillOpacity={0.2}
                  stroke={peak.severity === 'High' ? '#f44336' : '#ff9800'}
                  strokeOpacity={0.6}
                  cursor="pointer"
                  onClick={() => handlePeakClick(peak)}
                />
              ))}

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

      {/* Demomodaali piikkien muokkaamiseen */}
      <Dialog
        open={Boolean(selectedPeak)}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f5f5f5' }}>
          Edit peak id: {selectedPeak?.id}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
          <Typography variant="body1">
            Peak type:{' '}
            <Box
              component="span"
              sx={{
                color: selectedPeak?.severity === 'High' ? 'error.main' : 'warning.main',
                fontWeight: 'bold',
              }}
            >
              {selectedPeak?.severity}
            </Box>
          </Typography>

          <TextField
            label="Start time"
            defaultValue={dayjs(selectedPeak?.startTime).format('DD.MM.YYYY HH:mm')}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="End time"
            defaultValue={dayjs(selectedPeak?.endTime).format('DD.MM.YYYY HH:mm')}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeakDetectionChart;
