import { useState, useMemo, useEffect } from 'react';
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
  Line,
} from 'recharts';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface PeakDetectionChartProps {
  facility: string;
  startDate: string;
  endDate: string;
  emissionsData: any[];
  peaksData: any[];
}

interface DataPoint {
  timestamp: string;
  counts: number;
}

interface EmissionPeak {
  id: string;
  startTime: string;
  endTime: string;
  severity: string;
}

const PeakDetectionChart: React.FC<PeakDetectionChartProps> = ({
  facility,
  startDate,
  endDate,
  emissionsData,
  peaksData,
}) => {
  const [selectedPeak, setSelectedPeak] = useState<EmissionPeak | null>(null);
  const [currentDate, setCurrentDate] = useState(dayjs(startDate).startOf('day'));
  const [isDailyView, setIsDailyView] = useState(true);

  useEffect(() => {
    setCurrentDate(dayjs(startDate).startOf('day'));
  }, [startDate]);

  const handlePrevDay = () => setCurrentDate((prev) => prev.subtract(1, 'day'));
  const handleNextDay = () => setCurrentDate((prev) => prev.add(1, 'day'));

  //block trying to go over the fetched data dates
  const isAtStart = currentDate.isSameOrBefore(dayjs(startDate).startOf('day'));
  const isAtEnd = currentDate.isSameOrAfter(dayjs(endDate).startOf('day'));

  const timeFormat = isDailyView ? 'HH:mm:ss' : 'DD.MM. HH:mm:ss';

  const filteredData = useMemo(() => {
    if (!emissionsData || emissionsData.length === 0) return [];

    let dataToShow = emissionsData;

    if (isDailyView) {
      const startOfDay = currentDate.startOf('day');
      const endOfDay = currentDate.endOf('day');

      dataToShow = emissionsData.filter((point) => {
        const pointDate = dayjs(point.timestamp);
        return (
          (pointDate.isAfter(startOfDay) || pointDate.isSame(startOfDay)) &&
          (pointDate.isBefore(endOfDay) || pointDate.isSame(endOfDay))
        );
      });
    }

    return dataToShow.map((point) => ({
      ...point,
      displayTime: dayjs(point.timestamp).format(timeFormat),
      counts: Math.round(point.counts * 100) / 100,
    }));
  }, [emissionsData, currentDate, isDailyView, timeFormat]);

  const formattedPeaks = useMemo(() => {
    if (!peaksData) return [];

    let peaksToShow = peaksData;

    if (isDailyView) {
      const startOfDay = currentDate.startOf('day');
      const endOfDay = currentDate.endOf('day');

      peaksToShow = peaksData.filter((peak) => {
        const peakStart = dayjs(peak.startTime);
        return (
          (peakStart.isAfter(startOfDay) || peakStart.isSame(startOfDay)) &&
          (peakStart.isBefore(endOfDay) || peakStart.isSame(endOfDay))
        );
      });
    }

    return peaksToShow.map((peak) => ({
      ...peak,
      displayStart: dayjs(peak.startTime).format(timeFormat),
      displayEnd: dayjs(peak.endTime).format(timeFormat),
    }));
  }, [peaksData, currentDate, isDailyView, timeFormat]);

  const handlePeakClick = (peak: any) => setSelectedPeak(peak);
  const handleCloseModal = () => setSelectedPeak(null);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          px: 2,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={() => setIsDailyView(!isDailyView)}
        >
          {isDailyView ? 'Show Full View' : 'Show Daily View'}
        </Button>

        {isDailyView && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handlePrevDay} disabled={isAtStart} color="primary">
              <ArrowBackIosNewIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', minWidth: 250, textAlign: 'center' }}
            >
              {currentDate.format('dddd, DD.MM.YYYY')}
            </Typography>

            <IconButton onClick={handleNextDay} disabled={isAtEnd} color="primary">
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        )}

        {/*Just a filler box to keep U more consistent between Daily/Whole view states*/}
        <Box sx={{ width: 130 }} />
      </Box>

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
              {/* Threshold */}
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="#ff4d4d"
                strokeDasharray="5 5"
                dot={false}
                name="Threshold"
                isAnimationActive={false}
              />

              {/* Emission counts*/}
              <Area
                type="monotone"
                dataKey="counts"
                stroke="#4caf50"
                fill="#e8f5e9"
                strokeWidth={2}
                name="Counts"
                isAnimationActive={false}
              />

              {formattedPeaks.map((peak, index) => (
                <ReferenceArea
                  key={index}
                  x1={peak.displayStart}
                  x2={peak.displayEnd}
                  fill="#f44336"
                  fillOpacity={0.2}
                  stroke="#f44336"
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
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
            label="Start time"
            defaultValue={dayjs(selectedPeak?.startTime).format('DD.MM.YYYY HH:mm:ss')}
            InputProps={{ readOnly: true }}
            sx={{ mt: 1 }}
          />
          <TextField
            label="End time"
            defaultValue={dayjs(selectedPeak?.endTime).format('DD.MM.YYYY HH:mm:ss')}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Notes"
            placeholder="Additional notes or comments..."
            multiline
            rows={4}
            fullWidth
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
