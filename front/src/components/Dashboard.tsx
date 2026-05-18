import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import Charts from './Charts';
import dayjs from 'dayjs';
import {
  fetchEmissionData,
  savePeaksToBackend,
  fetchSavedPeaks,
} from '../services/emissionService';
import { exportToExcel } from '../utils/exportUtils';
import { useData } from '../context/DataContext';

const Dashboard = () => {
  const {
    facility,
    startDate,
    endDate,
    emissionsData,
    setEmissionsData,
    peaksData,
    setPeaksData,
    savedPeaks,
    setSavedPeaks,
  } = useData();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emissionsData.length > 0 && savedPeaks.length > 0) return;
    if (facility === 'Not Selected' || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchEmissionData(facility, startDate, endDate),
      fetchSavedPeaks(facility),
    ])
      .then(([rawResponse, savedResponse]) => {
        setEmissionsData(rawResponse.emissions || []);
        setPeaksData(rawResponse.peaks || []);
        setSavedPeaks(savedResponse || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Data fetching from server failed.');
      })
      .finally(() => setLoading(false));
  }, [
    facility,
    startDate,
    endDate,
    emissionsData.length,
    savedPeaks.length,
    setEmissionsData,
    setPeaksData,
    setSavedPeaks,
  ]);

  const handleExport = () => {
    const peaksWithArea = addAreaToApprovedPeaks(peaksData, emissionsData);
    exportToExcel(peaksWithArea, facility);
  };

  // adds area calc to approved peaks before they are saved
  const addAreaToApprovedPeaks = (peaks: any[], rawData: any[]) => {
    return peaks.map((peak) => {
      const startMs = dayjs(peak.startTime).valueOf();
      const endMs = dayjs(peak.endTime).valueOf();

      const pointsInPeak = rawData.filter((point) => {
        const pointMs = dayjs(point.timestamp).valueOf();
        return pointMs >= startMs && pointMs <= endMs;
      });

      let area = 0;
      pointsInPeak.forEach((point) => {
        // TODO: just a placeholder with the 0 for demo purposes.
        const threshold = point.threshold || 0;
        if (point.counts > threshold) {
          area += point.counts - threshold;
        }
      });

      return {
        ...peak,
        area: Math.round(area * 100) / 100,
      };
    });
  };

  const handleSaveToBackend = () => {
    if (window.confirm('Are you sure you want to save currently approved peaks?')) {
      setLoading(true);

      const peaksWithArea = addAreaToApprovedPeaks(peaksData, emissionsData);

      savePeaksToBackend(facility, peaksWithArea)
        .then(() => {
          return fetchSavedPeaks(facility);
        })
        .then((updatedSavedPeaks) => {
          setSavedPeaks(updatedSavedPeaks);
          alert('Peaks saved and annual data updated successfully!');
        })
        .catch((err) => {
          console.error(err);
          alert('Error while trying to save data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Dashboard: {facility}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
          >
            Time range: {dayjs(startDate).format('DD.MM.YYYY')} -{' '}
            {dayjs(endDate).format('DD.MM.YYYY')}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={handleSaveToBackend}
          disabled={peaksData.length === 0 || loading}
          sx={{ px: 4, py: 1 }}
        >
          Save Approved Peak data
        </Button>

        <Button
          variant="contained"
          onClick={handleExport}
          disabled={peaksData.length === 0 || loading}
          sx={{ bgcolor: '#60c9f8', '&:hover': { bgcolor: '#4fb8e7' }, px: 4, py: 1 }}
        >
          Export Report
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Charts
          facility={facility}
          startDate={startDate}
          endDate={endDate}
          emissionsData={emissionsData}
          peaksData={peaksData}
        />
      )}
    </Box>
  );
};

export default Dashboard;
