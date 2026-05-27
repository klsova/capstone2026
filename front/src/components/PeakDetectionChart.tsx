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
  ReferenceLine,
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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useData } from '../context/DataContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { calculatePeakArea } from '../services/emissionService';

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
  notes?: string;
}

const CustomTooltip = ({ active, payload, label, timeFormat, formattedPeaks }: any) => {
  if (active && payload && payload.length) {
    const currentMs = label;

    const activePeak = formattedPeaks.find(
      (p: any) => currentMs >= p.startMs && currentMs <= p.endMs,
    );

    return (
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          p: 1.5,
          border: '1px solid #ccc',
          borderRadius: 1,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {dayjs(currentMs).format(timeFormat)}
        </Typography>

        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name} : {entry.value}
          </Typography>
        ))}

        {activePeak && activePeak.area !== undefined && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #ccc' }}>
            <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
              Peak Area: {activePeak.area} units
            </Typography>

            <Typography variant="caption" sx={{ color: '#666' }}>
              ID: {activePeak.id}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
};

const PeakDetectionChart: React.FC<PeakDetectionChartProps> = ({
  facility,
  startDate,
  endDate,
  emissionsData,
  // peaksData,
}) => {
  const { peaksData, setPeaksData } = useData();

  const [selectedPeak, setSelectedPeak] = useState<EmissionPeak | null>(null);
  const [currentDate, setCurrentDate] = useState(dayjs(startDate).startOf('day'));
  const [isDailyView, setIsDailyView] = useState(true);

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Modal states
  const [tempStartTime, setTempStartTime] = useState<dayjs.Dayjs | null>(null);
  const [tempEndTime, setTempEndTime] = useState<dayjs.Dayjs | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  useEffect(() => {
    if (selectedPeak) {
      setTempStartTime(dayjs(selectedPeak.startTime));
      setTempEndTime(dayjs(selectedPeak.endTime));
      setTempNotes(selectedPeak.notes || '');
    }
  }, [selectedPeak]);

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
      timeMs: dayjs(point.timestamp).valueOf(),
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

    return peaksToShow.map((peak) => {
      const startMs = dayjs(peak.startTime).valueOf();
      const endMs = dayjs(peak.endTime).valueOf();

      return {
        ...peak,
        startMs,
        endMs,
        isSinglePoint: startMs === endMs,
        displayStart: dayjs(peak.startTime).format(timeFormat),
        displayEnd: dayjs(peak.endTime).format(timeFormat),
      };
    });
  }, [peaksData, currentDate, isDailyView, timeFormat]);

  const handleChartClick = (e: any) => {
    //checks that click is hitting a data point within the chart
    if (!e || !e.activeLabel) return;

    const clickedMs = e.activeLabel;

    const clickedExisting = peaksData.find((p) => {
      const startMs = dayjs(p.startTime).valueOf();
      const endMs = dayjs(p.endTime).valueOf();
      return clickedMs >= startMs && clickedMs <= endMs;
    });

    if (clickedExisting) {
      setIsCreatingNew(false);
      setSelectedPeak(clickedExisting);
    } else {
      setIsCreatingNew(true);
      setSelectedPeak({
        id: `manual-${dayjs(clickedMs).format('DDMMHHmmss')}`,
        startTime: dayjs(clickedMs).toISOString(),
        endTime: dayjs(clickedMs).add(2, 'minute').toISOString(),
        notes: '',
      });
    }
  };

  const handleCloseModal = () => {
    setSelectedPeak(null);
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!selectedPeak || !tempStartTime || !tempEndTime) return;

    const newStartMs = tempStartTime.valueOf();
    const newEndMs = tempEndTime.valueOf();

    const overlappingPeaks = peaksData.filter((p) => {
      if (!isCreatingNew && p.id === selectedPeak.id) return false;

      const pStartMs = dayjs(p.startTime).valueOf();
      const pEndMs = dayjs(p.endTime).valueOf();

      return newStartMs < pEndMs && newEndMs > pStartMs;
    });

    let peaksToKeep = peaksData;

    if (overlappingPeaks.length > 0) {
      const confirmMessage = `This peak overlaps with ${overlappingPeaks.length} existing peak(s).\n\nRemove the overlapping peaks with this one?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }
      const overlappingIds = overlappingPeaks.map((p) => p.id);
      peaksToKeep = peaksData.filter((p) => !overlappingIds.includes(p.id));
    }

    const newArea = calculatePeakArea(
      tempStartTime.toISOString(),
      tempEndTime.toISOString(),
      emissionsData,
    );

    if (isCreatingNew) {
      const newPeak = {
        id: selectedPeak.id,
        startTime: tempStartTime.toISOString(),
        endTime: tempEndTime.toISOString(),
        notes: tempNotes,
        area: newArea,
      };
      setPeaksData([...peaksToKeep, newPeak]);
    } else {
      const updatedPeaks = peaksToKeep.map((p) => {
        if (p.id === selectedPeak.id) {
          return {
            ...p,
            startTime: tempStartTime.toISOString(),
            endTime: tempEndTime.toISOString(),
            notes: tempNotes,
            area: newArea,
          };
        }
        return p;
      });
      setPeaksData(updatedPeaks);
    }

    handleCloseModal();
  };

  const handleDelete = () => {
    if (!selectedPeak) return;

    if (window.confirm('Are you sure you want to delete this peak?')) {
      const filteredPeaks = peaksData.filter((p) => p.id !== selectedPeak.id);
      setPeaksData(filteredPeaks);
      handleCloseModal();
    }
  };

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
            <AreaChart data={filteredData} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timeMs"
                type="number"
                domain={['dataMin', 'dataMax']}
                scale={'time'}
                tickFormatter={(unixTime) => dayjs(unixTime).format(timeFormat)}
                fontSize={10}
                minTickGap={50}
                tick={{ fill: '#666' }}
              />
              <YAxis fontSize={10} tick={{ fill: '#666' }} />
              {/*               <Tooltip
                labelFormatter={(unixTime) => dayjs(unixTime).format(timeFormat)}
              /> */}
              <Tooltip
                content={
                  <CustomTooltip
                    timeFormat={timeFormat}
                    formattedPeaks={formattedPeaks}
                  />
                }
              />
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

              {formattedPeaks.map((peak, index) =>
                peak.isSinglePoint ? (
                  <ReferenceLine
                    key={`line-${index}`}
                    x={peak.startMs}
                    stroke="#f44336"
                    strokeWidth={4}
                    strokeOpacity={0.8}
                    cursor="pointer"
                  />
                ) : (
                  <ReferenceArea
                    key={`area-${index}`}
                    x1={peak.startMs}
                    x2={peak.endMs}
                    fill="#f44336"
                    fillOpacity={0.2}
                    stroke="#f44336"
                    strokeOpacity={0.6}
                    cursor="pointer"
                  />
                ),
              )}

              <Brush
                dataKey="timeMs"
                tickFormatter={(unixTime) => dayjs(unixTime).format(timeFormat)}
                height={30}
                stroke="#60c9f8"
                fill="#fff"
                travellerWidth={10}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Modal for editing peaks */}
      <Dialog
        open={Boolean(selectedPeak)}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {isCreatingNew ? 'Add New Peak' : `Edit peak id: ${selectedPeak?.id}`}
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          {/*           <TextField
            label="Start time"
            defaultValue={dayjs(selectedPeak?.startTime).format('DD.MM.YYYY HH:mm:ss')}
            InputProps={{ readOnly: true }}
            sx={{ mt: 1 }}
          /> */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Time"
              value={tempStartTime}
              onChange={(newValue) => setTempStartTime(newValue)}
              ampm={false}
              format="DD.MM.YYYY HH:mm:ss"
              views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
              sx={{ mt: 1 }}
            />

            {/*           <TextField
            label="End time"
            defaultValue={dayjs(selectedPeak?.endTime).format('DD.MM.YYYY HH:mm:ss')}
            InputProps={{ readOnly: true }}
          /> */}

            <DateTimePicker
              label="End Time"
              value={tempEndTime}
              onChange={(newValue) => setTempEndTime(newValue)}
              ampm={false}
              format="DD.MM.YYYY HH:mm:ss"
              views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
              //minDateTime={tempStartTime}
            />
          </LocalizationProvider>
          <TextField
            label="Notes"
            placeholder="Additional notes or comments..."
            multiline
            rows={4}
            fullWidth
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#fafafa', justifyContent: 'space-between' }}>
          <Box>
            {!isCreatingNew && (
              <Button onClick={handleDelete} color="error" variant="text">
                Delete
              </Button>
            )}
          </Box>
          <Box>
            <Button onClick={handleCloseModal} color="inherit" sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              {isCreatingNew ? 'Add New Peak' : `Save changes`}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeakDetectionChart;
