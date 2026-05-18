import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
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
  const [nSigma, setNSigma] = useState<number>(6);
  const [isSigmaModalOpen, setSigmaModalOpen] = useState(false);
  const [tempSigma, setTempSigma] = useState(6);

  useEffect(() => {
    if (emissionsData.length > 0 && savedPeaks.length > 0) return;
    if (facility === 'Not Selected' || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchEmissionData(facility, startDate, endDate, nSigma),
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
    nSigma,
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
        <>
          <Charts
            facility={facility}
            startDate={startDate}
            endDate={endDate}
            emissionsData={emissionsData}
            peaksData={peaksData}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 4 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setTempSigma(nSigma);
                setSigmaModalOpen(true);
              }}
              startIcon={<SettingsIcon />}
              sx={{ px: 2, py: 1 }}
            >
              Adjust Threshold (multiplier: {nSigma})
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveToBackend}
              disabled={peaksData.length === 0 || loading}
              sx={{
                bgcolor: '#60c9f8',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#4fb8e7' },
                px: 5,
                py: 1,
                fontSize: '1rem',
              }}
            >
              Save Approved Peak Data
            </Button>
          </Box>
        </>
      )}

      <Dialog
        open={isSigmaModalOpen}
        onClose={() => setSigmaModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f5f5f5' }}>Adjust Threshold Multiplier</DialogTitle>
        <DialogContent sx={{ pt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography gutterBottom>
            Threshold Multiplier: <strong>{tempSigma}</strong>
          </Typography>
          <Slider
            value={tempSigma}
            onChange={(_, newValue) => setTempSigma(newValue as number)}
            step={1}
            marks
            min={1}
            max={10}
            valueLabelDisplay="auto"
            sx={{ color: '#60c9f8' }}
          />
          <Typography variant="caption" color="text.secondary">
            Default is 6.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
          <Button onClick={() => setSigmaModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setEmissionsData([]);
              setNSigma(tempSigma);
              setSigmaModalOpen(false);
            }}
            variant="contained"
            sx={{ bgcolor: '#60c9f8', color: '#000' }}
          >
            Refetch Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
